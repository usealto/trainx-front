import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  CommentDtoApi,
  QuestionSubmittedDtoApi,
  QuestionSubmittedDtoApiStatusEnumApi,
} from '@usealto/sdk-ts-angular';
import { addDays, compareDesc, differenceInDays, isAfter, isBefore, isToday } from 'date-fns';
import { combineLatest, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { EmojiPipe } from 'src/app/core/utils/emoji/emoji.pipe';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';

export enum ETypeValue {
  COMMENTS = 'comments',
  QUESTIONS = 'questions',
}

enum ETabValue {
  PENDING = 'pending',
  ARCHIVED = 'archived',
  ALL = 'all',
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
  providers: [EmojiPipe],
})
export class LeadCollaborationComponent implements OnInit {
  itemsPerPage = 10;

  Emoji = EmojiName;
  I18ns = I18ns;

  readonly tabs: ITab[] = [
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

  readonly filters: { id: ETypeValue; name: string }[] = [
    {
      id: ETypeValue.COMMENTS,
      name: I18ns.collaboration.filters.types.comments,
    },
    {
      id: ETypeValue.QUESTIONS,
      name: I18ns.collaboration.filters.types.questions,
    },
  ];

  readonly periods: { id: EPeriodValue; name: string }[] = [
    { id: EPeriodValue.TODAY, name: I18ns.collaboration.filters.periods.today },
    { id: EPeriodValue.WEEK, name: I18ns.collaboration.filters.periods.week },
    { id: EPeriodValue.MONTH, name: I18ns.collaboration.filters.periods.month },
    { id: EPeriodValue.OLD, name: I18ns.collaboration.filters.periods.old },
  ];

  contributors: { id: string; name: string }[] = [];

  comments: CommentDtoApi[] = [];
  submittedQuestions: QuestionSubmittedDtoApi[] = [];

  selectedTypesFilters: { id: ETypeValue; name: string }[] = [];
  selectedContributorsFilters: { id: string; name: string }[] = [];
  selectedPeriodsFilters: { id: EPeriodValue; name: string }[] = [];

  contributionsByPeriod: {
    period: EPeriodValue;
    contributions: IContribution[];
  }[] = [];

  selectedTab!: ITab;
  pendingCount = 0;
  showMoreButton = true;

  emptyPlaceholderData?: {
    emojiSrc: string;
    title: string;
    subtitle: string;
    allowResetFilters: boolean;
  };

  constructor(
    private readonly commentsRestService: CommentsRestService,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly emojiPipe: EmojiPipe,
    private readonly router: Router,
    private readonly location: Location,
  ) {}

  ngOnInit(): void {
    this.initContributionsByPeriod();

    this.activatedRoute.queryParams
      .pipe(
        tap((par) => {
          this.selectedTab =
            par['tab'] && this.tabs.map(({ index }) => index.toFixed()).includes(par['tab'])
              ? this.tabs[+par['tab'] - 1]
              : this.tabs[0];
          const typesFromParams = par['type']
            ? par['type'] instanceof Array
              ? par['type']
              : [par['type']]
            : [];
          this.selectedTypesFilters = this.filters.filter(({ id }) => typesFromParams.includes(id));

          this.getCollaborationData();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  getCollaborationData(): void {
    combineLatest([
      this.commentsRestService.getCommentsCount(),
      this.questionsSubmittedRestService.getQuestionsCount(),
    ])
      .pipe(
        switchMap(([commentsCount, questionsSubmittedCount]) => {
          return combineLatest([
            this.commentsRestService.getCommentsPaginated({
              itemsPerPage: commentsCount ?? 0,
            }),
            this.questionsSubmittedRestService.getQuestionsPaginated({
              itemsPerPage: questionsSubmittedCount ?? 0,
            }),
          ]);
        }),
        tap(([comments, submittedQuestions]) => {
          this.comments = [...(comments.data ?? [])];
          this.submittedQuestions = [...(submittedQuestions.data ?? [])];
          this.pendingCount =
            this.comments.filter((comment) => !comment.isRead).length +
            this.submittedQuestions.filter(
              ({ status }) => status === QuestionSubmittedDtoApiStatusEnumApi.Submitted,
            ).length;

          this.contributors = [
            ...this.comments.map(({ createdByUser }) => createdByUser),
            ...this.submittedQuestions.map(({ createdByUser }) => createdByUser),
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

  private getSelectedTabData(): void {
    let data: IContribution[] = [];
    const today = new Date();
    const includeComments =
      this.selectedTypesFilters.length === 0 ||
      this.selectedTypesFilters.some(({ id }) => id === ETypeValue.COMMENTS);
    const includeQuestions =
      this.selectedTypesFilters.length === 0 ||
      this.selectedTypesFilters.some(({ id }) => id === ETypeValue.QUESTIONS);

    switch (this.selectedTab.value) {
      case ETabValue.PENDING:
        data = [
          ...this.comments
            .filter((comment) => {
              return includeComments && !comment.isRead;
            })
            .map((comment) => this.createContributionFromData(comment, ETypeValue.COMMENTS)),
          ...this.submittedQuestions
            .filter(({ status }) => {
              return includeQuestions && status === QuestionSubmittedDtoApiStatusEnumApi.Submitted;
            })
            .map((question) => this.createContributionFromData(question, ETypeValue.QUESTIONS)),
        ];
        break;
      case ETabValue.ARCHIVED:
        data = [
          ...this.comments
            .filter((comment) => {
              return includeComments && comment.isRead;
            })
            .map((comment) => this.createContributionFromData(comment, ETypeValue.COMMENTS)),
          ...this.submittedQuestions
            .filter(({ status }) => {
              return includeQuestions && status !== QuestionSubmittedDtoApiStatusEnumApi.Submitted;
            })
            .map((question) => this.createContributionFromData(question, ETypeValue.QUESTIONS)),
        ];
        break;
      case ETabValue.ALL:
        data = [
          ...(includeComments ? this.comments : []).map((comment) =>
            this.createContributionFromData(comment, ETypeValue.COMMENTS),
          ),
          ...(includeQuestions ? this.submittedQuestions : []).map((question) =>
            this.createContributionFromData(question, ETypeValue.QUESTIONS),
          ),
        ];
        break;
    }

    data.sort((a, b) => compareDesc(a.createdAt, b.createdAt));
    data = this.filterByContributors(data, this.selectedContributorsFilters);
    data = this.filterByPeriod(data, this.selectedPeriodsFilters);

    this.showMoreButton = data.length > this.itemsPerPage;

    if (data.length === 0) {
      if (this.comments.length > 0 || this.submittedQuestions.length > 0) {
        this.emptyPlaceholderData = {
          emojiSrc: this.emojiPipe.transform(EmojiName.MagnifyingGlassTiltedLeft),
          title: I18ns.collaboration.placeholder.emptySearchTitle,
          subtitle: I18ns.collaboration.placeholder.emptySearchSubtitle,
          allowResetFilters: true,
        };
      } else {
        switch (this.selectedTab.value) {
          case ETabValue.PENDING:
            this.emptyPlaceholderData = {
              emojiSrc: this.emojiPipe.transform(EmojiName.SmilingFaceWithSunglasses),
              title: I18ns.collaboration.placeholder.pendingTitle,
              subtitle: I18ns.collaboration.placeholder.pendingSubtitle,
              allowResetFilters: false,
            };
            break;
          case ETabValue.ARCHIVED:
            this.emptyPlaceholderData = {
              emojiSrc: this.emojiPipe.transform(EmojiName.SleepingFace),
              title: I18ns.collaboration.placeholder.archivedTitle,
              subtitle: I18ns.collaboration.placeholder.archivedSubtitle,
              allowResetFilters: false,
            };
            break;
          case ETabValue.ALL:
            this.emptyPlaceholderData = {
              emojiSrc: this.emojiPipe.transform(EmojiName.SleepingFace),
              title: I18ns.collaboration.placeholder.allTitle,
              subtitle: I18ns.collaboration.placeholder.allSubtitle,
              allowResetFilters: false,
            };
            break;
        }
      }
    } else {
      this.emptyPlaceholderData = undefined;
    }

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

  private filterByContributors(
    data: IContribution[],
    contributors: { id: string; name: string }[],
  ): IContribution[] {
    return data.filter(
      ({ contributorId }) => contributors.length === 0 || contributors.some(({ id }) => id === contributorId),
    );
  }

  private filterByPeriod(
    data: IContribution[],
    periods: { id: EPeriodValue; name: string }[],
  ): IContribution[] {
    return data.filter(({ createdAt }) => {
      const date = new Date(createdAt);
      const today = new Date();
      return (
        periods.length === 0 ||
        (periods.some(({ id }) => id === EPeriodValue.TODAY) && isToday(date)) ||
        (periods.some(({ id }) => id === EPeriodValue.WEEK) &&
          isBefore(date, today) &&
          isAfter(date, addDays(today, -7))) ||
        (periods.some(({ id }) => id === EPeriodValue.MONTH) &&
          isBefore(date, today) &&
          isAfter(date, addDays(today, -30))) ||
        (periods.some(({ id }) => id === EPeriodValue.OLD) && differenceInDays(today, date) > 30)
      );
    });
  }

  handleTabChange(tab: ITab): void {
    this.selectedTab = tab;

    this.location.replaceState(
      this.router.serializeUrl(
        this.router.createUrlTree([], {
          queryParams: { tab: tab.index },
          queryParamsHandling: 'merge',
        }),
      ),
    );
    this.getSelectedTabData();
  }

  handleContributorChange(contributors: { id: string; name: string }[]): void {
    this.selectedContributorsFilters = [...contributors];
    this.getSelectedTabData();
  }

  handleTypeChange(filters: { id: ETypeValue; name: string }[]): void {
    this.selectedTypesFilters = [...filters];

    this.location.replaceState(
      this.router.serializeUrl(
        this.router.createUrlTree([], {
          queryParams: {
            type: filters.map(({ id }) => id),
          },
          queryParamsHandling: 'merge',
        }),
      ),
    );
    this.getSelectedTabData();
  }

  handlePeriodChange(periods: { id: EPeriodValue; name: string }[]): void {
    this.selectedPeriodsFilters = [...periods];
    this.getSelectedTabData();
  }

  getQuestionFromContribution(contribution: IContribution): QuestionSubmittedDtoApi {
    return contribution.data as QuestionSubmittedDtoApi;
  }

  getCommentFromContribution(contribution: IContribution): CommentDtoApi {
    return contribution.data as CommentDtoApi;
  }

  showMore(): void {
    this.itemsPerPage += 10;
    this.getSelectedTabData();
  }

  resetFilters(): void {
    this.selectedContributorsFilters = [];
    this.selectedTypesFilters = [];
    this.selectedPeriodsFilters = [];
    this.emptyPlaceholderData = undefined;
    this.getSelectedTabData();
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
