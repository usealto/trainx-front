import { Component, OnInit } from '@angular/core';
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

import {
  compareDesc,
  differenceInDays,
  isToday,
  isSameWeek,
  isSameMonth
} from 'date-fns'

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
}

interface IContribution {
  contributorId: string;
  createdAt: Date;
  updatedAt: Date;
  type: ETypeValue;
  data: CommentDtoApi | QuestionSubmittedDtoApi;
}

@Component({
  selector: 'alto-lead-collaboration',
  templateUrl: './lead-collaboration.component.html',
  styleUrls: ['./lead-collaboration.component.scss'],
})
export class LeadCollaborationComponent implements OnInit {
  readonly itemsPerPage = 10;

  Emoji = EmojiName;
  I18ns = I18ns;

  tabs: ITab[] = [
    { label: I18ns.collaboration.tabs.pending, value: ETabValue.PENDING },
    { label: I18ns.collaboration.tabs.archived, value: ETabValue.ARCHIVED },
    { label: I18ns.collaboration.tabs.all, value: ETabValue.ALL },
  ];

  filters: { id: ETypeValue, name: string }[] = [
    { id: ETypeValue.COMMENTS, name: I18ns.collaboration.filters.types.comments },
    { id: ETypeValue.QUESTIONS, name: I18ns.collaboration.filters.types.questions },
  ];

  periods: { id: EPeriodValue, name: string }[] = [
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

  contributions: IContribution[] = [];

  selectedTab = this.tabs[0];
  contributors: { id: string; name: string }[] = [];
  pendingCount = 0;

  constructor(
    private readonly commentsRestService: CommentsRestService,
    private readonly questionsSubmittedTestService: QuestionsSubmittedRestService,
  ) {}

  ngOnInit(): void {
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
              acc.push({ id: contributor.id, name: `${contributor.firstname} ${contributor.lastname}` });
            }

            return acc;
          }, [] as { id: string; name: string }[]);

          this.handleTabChange(this.tabs[0])
        }),
      )
      .subscribe();
  }

  handleTabChange(tab: ITab): void {
    this.selectedTab = tab;
    this.getSelectedTabData(tab);
  }

  private createContributionFromData(data: CommentDtoApi | QuestionSubmittedDtoApi, type: ETypeValue): IContribution {
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

    switch (tab.value) {
      case ETabValue.PENDING:
        data = [
          ...this.comments
            .filter((comment) => {
              return (this.typesFilters.length === 0 || this.typesFilters.includes(ETypeValue.COMMENTS))
                && !comment.isRead;
            })
            .map((comment) => this.createContributionFromData(comment, ETypeValue.COMMENTS)),
          ...this.submittedQuestions
            .filter(({ status }) => {
              return (this.typesFilters.length === 0 || this.typesFilters.includes(ETypeValue.QUESTIONS))
                && status === QuestionSubmittedDtoApiStatusEnumApi.Submitted
            })
            .map((question) => this.createContributionFromData(question, ETypeValue.QUESTIONS)),
        ];
        break;
      case ETabValue.ARCHIVED:
        data = [
          ...this.comments
            .filter((comment) => {
              return (this.typesFilters.length === 0 || this.typesFilters.includes(ETypeValue.COMMENTS))
                && comment.isRead;
            })
            .map((comment) => this.createContributionFromData(comment, ETypeValue.COMMENTS)),
          ...this.submittedQuestions
            .filter(({ status }) => {
              return (this.typesFilters.length === 0 || this.typesFilters.includes(ETypeValue.QUESTIONS))
                && status !== QuestionSubmittedDtoApiStatusEnumApi.Submitted;
            })
            .map((question) => this.createContributionFromData(question, ETypeValue.QUESTIONS)),
        ];
        break;
      case ETabValue.ALL:
        data = [
          ...(this.typesFilters.length === 0 || this.typesFilters.includes(ETypeValue.COMMENTS) ? this.comments : [])
            .map((comment) => this.createContributionFromData(comment, ETypeValue.COMMENTS)),
          ...(this.typesFilters.length === 0 || this.typesFilters.includes(ETypeValue.QUESTIONS) ? this.submittedQuestions : [])
            .map((question) => this.createContributionFromData(question, ETypeValue.QUESTIONS)),
        ];
        break;
    }

    data.sort((a, b) => compareDesc(a.createdAt, b.createdAt));
    data = this.filterByContributors(data, this.contributorsFilters);
    data = this.filterByPeriod(data, this.periodsFilters);

    this.contributions = data.slice(0, this.itemsPerPage);
  }

  private filterByContributors(
    data: IContribution[],
    contributorsIds: string[]
  ): IContribution[] {
    return data.filter(({ contributorId }) => contributorsIds.length === 0 || contributorsIds.includes(contributorId));
  }

  private filterByPeriod(
    data: IContribution[],
    periods: EPeriodValue[]
  ): IContribution[] {
    return data.filter(({ createdAt }) => {
      const date = new Date(createdAt);
      const today = new Date();

      return periods.length === 0
        || (periods.includes(EPeriodValue.TODAY) && isToday(date))
        || (periods.includes(EPeriodValue.WEEK) && isSameWeek(date, today))
        || (periods.includes(EPeriodValue.MONTH) && isSameMonth(date, today))
        || (periods.includes(EPeriodValue.OLD) && differenceInDays(today, date) > 30);
    });
  }

  handleContributorChange(contributors: {id: string, name: string}[]): void {
    this.contributorsFilters = contributors.map(({ id }) => id);
    this.getSelectedTabData(this.selectedTab);
  }

  handleTypeChange(filters: {id: ETypeValue, name: string}[]): void {
    this.typesFilters = filters.map(({ id }) => id);
    this.getSelectedTabData(this.selectedTab);
  }

  handlePeriodChange(periods: {id: EPeriodValue, name: string}[]): void {
    this.periodsFilters = periods.map(({ id }) => id);
    this.getSelectedTabData(this.selectedTab);
  }

  getQuestionFromContribution(contribution: IContribution): QuestionSubmittedDtoApi {
    return contribution.data as QuestionSubmittedDtoApi;
  }

  getCommentFromContribution(contribution: IContribution): CommentDtoApi {
    return contribution.data as CommentDtoApi;
  }
}
