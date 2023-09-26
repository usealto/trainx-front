import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  CommentDtoApi,
  QuestionSubmittedDtoApi,
  QuestionSubmittedDtoApiStatusEnumApi,
} from '@usealto/sdk-ts-angular';
import { combineLatest, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';

import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { addDays, compareDesc, differenceInDays, isAfter, isBefore, isToday } from 'date-fns';

enum ETabValue {
  PENDING = 'pending',
  ARCHIVED = 'archived',
  ALL = 'all',
}

enum ETypeValue {
  COMMENTS = 'comments',
  QUESTIONS = 'questions',
}

enum EPeriodValue {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  OLD = 'old',
}

interface ITab {
  label: string;
  value: ETabValue;
  index: number;
}

interface IContribution {
  contributorId: string;
  createdAt: Date;
  updatedAt: Date;
  type: ETypeValue;
  data: CommentDtoApi | QuestionSubmittedDtoApi;
}

@UntilDestroy()
@Component({
  selector: 'alto-lead-collaboration',
  templateUrl: './lead-collaboration.component.html',
  styleUrls: ['./lead-collaboration.component.scss'],
})
export class LeadCollaborationComponent implements OnInit {
  itemsPerPage = 10;

  Emoji = EmojiName;
  I18ns = I18ns;

  tabs: ITab[] = [
    {
      label: I18ns.collaboration.tabs.pending,
      value: ETabValue.PENDING,
      index: 1,
    },
    {
      label: I18ns.collaboration.tabs.archived,
      value: ETabValue.ARCHIVED,
      index: 2,
    },
    { label: I18ns.collaboration.tabs.all, value: ETabValue.ALL, index: 3 },
  ];

  filters: { id: ETypeValue; name: string }[] = [
    {
      id: ETypeValue.COMMENTS,
      name: I18ns.collaboration.filters.types.comments,
    },
    {
      id: ETypeValue.QUESTIONS,
      name: I18ns.collaboration.filters.types.questions,
    },
  ];

  periods: { id: EPeriodValue; name: string }[] = [
    { id: EPeriodValue.TODAY, name: I18ns.collaboration.filters.periods.today },
    { id: EPeriodValue.WEEK, name: I18ns.collaboration.filters.periods.week },
    { id: EPeriodValue.MONTH, name: I18ns.collaboration.filters.periods.month },
    { id: EPeriodValue.OLD, name: I18ns.collaboration.filters.periods.old },
  ];

  comments: CommentDtoApi[] = [];
  submittedQuestions: QuestionSubmittedDtoApi[] = [];

  contributorsFilters: string[] = [];
  typesFilters: ETypeValue[] = [];
  periodsFilters: EPeriodValue[] = [];

  contributionsByPeriod: {
    period: EPeriodValue;
    contributions: IContribution[];
  }[] = [];

  selectedTab!: ITab;
  contributors: { id: string; name: string }[] = [];
  pendingCount = 0;
  showMoreButton = true;

  constructor(
    private readonly commentsRestService: CommentsRestService,
    private readonly questionsSubmittedTestService: QuestionsSubmittedRestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly location: Location,
  ) {}

  ngOnInit(): void {
    this.initContributionsByPeriod();

    this.activatedRoute.params
      .pipe(
        tap((par) => {
          this.selectedTab = par['tab'] ? this.tabs[+par['tab'] - 1] : this.tabs[0];
          this.getCollaborationData();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  getCollaborationData(): void {
    combineLatest([this.commentsRestService.getComments(), this.questionsSubmittedTestService.getQuestions()])
      .pipe(
        tap(([comments, submittedQuestions]) => {
          this.comments = comments;
          this.submittedQuestions = submittedQuestions;
          this.pendingCount =
            comments.filter((comment) => !comment.isRead).length +
            submittedQuestions.filter(
              ({ status }) => status === QuestionSubmittedDtoApiStatusEnumApi.Submitted,
            ).length;

          this.contributors = [
            ...comments.map(({ createdByUser }) => createdByUser),
            ...submittedQuestions.map(({ createdByUser }) => createdByUser),
          ].reduce((acc, contributor) => {
            if (!acc.find(({ id }) => id === contributor.id)) {
              acc.push({
                id: contributor.id,
                name: `${contributor.firstname} ${contributor.lastname}`,
              });
            }

            return acc;
          }, [] as { id: string; name: string }[]);

          this.handleTabChange(this.selectedTab);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  handleTabChange(tab: ITab): void {
    this.location.replaceState(
      '/' + this.location.path().split('/').slice(1, 3).join('/') + '/tab/' + tab.index,
    );
    this.selectedTab = tab;
    this.getSelectedTabData(tab);
  }

  private createContributionFromData(
    data: CommentDtoApi | QuestionSubmittedDtoApi,
    type: ETypeValue,
  ): IContribution {
    return {
      contributorId: data.createdBy,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      type,
      data,
    };
  }

  private getSelectedTabData(tab: ITab): void {
    let data: IContribution[] = [];
    const today = new Date();

    switch (tab.value) {
      case ETabValue.PENDING:
        data = [
          ...this.comments
            .filter((comment) => {
              return (
                (this.typesFilters.length === 0 || this.typesFilters.includes(ETypeValue.COMMENTS)) &&
                !comment.isRead
              );
            })
            .map((comment) => this.createContributionFromData(comment, ETypeValue.COMMENTS)),
          ...this.submittedQuestions
            .filter(({ status }) => {
              return (
                (this.typesFilters.length === 0 || this.typesFilters.includes(ETypeValue.QUESTIONS)) &&
                status === QuestionSubmittedDtoApiStatusEnumApi.Submitted
              );
            })
            .map((question) => this.createContributionFromData(question, ETypeValue.QUESTIONS)),
        ];
        break;
      case ETabValue.ARCHIVED:
        data = [
          ...this.comments
            .filter((comment) => {
              return (
                (this.typesFilters.length === 0 || this.typesFilters.includes(ETypeValue.COMMENTS)) &&
                comment.isRead
              );
            })
            .map((comment) => this.createContributionFromData(comment, ETypeValue.COMMENTS)),
          ...this.submittedQuestions
            .filter(({ status }) => {
              return (
                (this.typesFilters.length === 0 || this.typesFilters.includes(ETypeValue.QUESTIONS)) &&
                status !== QuestionSubmittedDtoApiStatusEnumApi.Submitted
              );
            })
            .map((question) => this.createContributionFromData(question, ETypeValue.QUESTIONS)),
        ];
        break;
      case ETabValue.ALL:
        data = [
          ...(this.typesFilters.length === 0 || this.typesFilters.includes(ETypeValue.COMMENTS)
            ? this.comments
            : []
          ).map((comment) => this.createContributionFromData(comment, ETypeValue.COMMENTS)),
          ...(this.typesFilters.length === 0 || this.typesFilters.includes(ETypeValue.QUESTIONS)
            ? this.submittedQuestions
            : []
          ).map((question) => this.createContributionFromData(question, ETypeValue.QUESTIONS)),
        ];
        break;
    }

    data.sort((a, b) => compareDesc(a.createdAt, b.createdAt));
    data = this.filterByContributors(data, this.contributorsFilters);
    data = this.filterByPeriod(data, this.periodsFilters);

    this.showMoreButton = data.length > this.itemsPerPage;
    data = data.slice(0, this.itemsPerPage);

    this.initContributionsByPeriod();
    data.forEach((item) => {
      // today
      if (isToday(item.createdAt)) {
        this.contributionsByPeriod[0].contributions.push(item);
        // week
      } else if (isAfter(item.createdAt, addDays(today, -7))) {
        this.contributionsByPeriod[1].contributions.push(item);
        // month
      } else if (isBefore(item.createdAt, today) && isAfter(item.createdAt, addDays(today, -30))) {
        this.contributionsByPeriod[2].contributions.push(item);
        //old
      } else {
        this.contributionsByPeriod[3].contributions.push(item);
      }
    });
  }

  private filterByContributors(data: IContribution[], contributorsIds: string[]): IContribution[] {
    return data.filter(
      ({ contributorId }) => contributorsIds.length === 0 || contributorsIds.includes(contributorId),
    );
  }

  private filterByPeriod(data: IContribution[], periods: EPeriodValue[]): IContribution[] {
    return data.filter(({ createdAt }) => {
      const date = new Date(createdAt);
      const today = new Date();
      return (
        periods.length === 0 ||
        (periods.includes(EPeriodValue.TODAY) && isToday(date)) ||
        (periods.includes(EPeriodValue.WEEK) && isBefore(date, today) && isAfter(date, addDays(today, -7))) ||
        (periods.includes(EPeriodValue.MONTH) &&
          isBefore(date, today) &&
          isAfter(date, addDays(today, -30))) ||
        (periods.includes(EPeriodValue.OLD) && differenceInDays(today, date) > 30)
      );
    });
  }

  handleContributorChange(contributors: { id: string; name: string }[]): void {
    this.contributorsFilters = contributors.map(({ id }) => id);
    this.getSelectedTabData(this.selectedTab);
  }

  handleTypeChange(filters: { id: ETypeValue; name: string }[]): void {
    this.typesFilters = filters.map(({ id }) => id);
    this.getSelectedTabData(this.selectedTab);
  }

  handlePeriodChange(periods: { id: EPeriodValue; name: string }[]): void {
    this.periodsFilters = periods.map(({ id }) => id);
    this.getSelectedTabData(this.selectedTab);
  }

  getQuestionFromContribution(contribution: IContribution): QuestionSubmittedDtoApi {
    return contribution.data as QuestionSubmittedDtoApi;
  }

  getCommentFromContribution(contribution: IContribution): CommentDtoApi {
    return contribution.data as CommentDtoApi;
  }

  showMore(): void {
    this.itemsPerPage += 10;
    this.getSelectedTabData(this.selectedTab);
  }

  initContributionsByPeriod() {
    this.contributionsByPeriod = [
      { period: EPeriodValue.TODAY, contributions: [] },
      { period: EPeriodValue.WEEK, contributions: [] },
      { period: EPeriodValue.MONTH, contributions: [] },
      { period: EPeriodValue.OLD, contributions: [] },
    ];
  }
}
