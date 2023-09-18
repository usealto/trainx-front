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

enum ETabValue {
  PENDING = 'pending',
  ARCHIVED = 'archived',
  ALL = 'all',
}

enum EFilterValue {
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

@Component({
  selector: 'alto-lead-collaboration',
  templateUrl: './lead-collaboration.component.html',
  styleUrls: ['./lead-collaboration.component.scss'],
})
export class LeadCollaborationComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;

  tabs: ITab[] = [
    { label: I18ns.collaboration.tabs.pending, value: ETabValue.PENDING },
    { label: I18ns.collaboration.tabs.archived, value: ETabValue.ARCHIVED },
    { label: I18ns.collaboration.tabs.all, value: ETabValue.ALL },
  ];

  filters: { id: EFilterValue, name: string }[] = [
    { id: EFilterValue.COMMENTS, name: I18ns.collaboration.filters.types.comments },
    { id: EFilterValue.QUESTIONS, name: I18ns.collaboration.filters.types.questions },
  ];

  periods: { id: EPeriodValue, name: string }[] = [
    { id: EPeriodValue.TODAY, name: I18ns.collaboration.filters.periods.today },
    { id: EPeriodValue.WEEK, name: I18ns.collaboration.filters.periods.week },
    { id: EPeriodValue.MONTH, name: I18ns.collaboration.filters.periods.month },
    { id: EPeriodValue.OLD, name: I18ns.collaboration.filters.periods.old },
  ];

  comments: CommentDtoApi[] = [];
  submittedQuestions: QuestionSubmittedDtoApi[] = [];
  selectedTabData: (CommentDtoApi | QuestionSubmittedDtoApi)[] = [];

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
        }),
        tap(() => this.handleTabChange(this.tabs[0]))
      )
      .subscribe();
  }

  handleTabChange(tab: ITab): void {
    this.selectedTab = tab;

    this.selectedTabData = this.getSelectedTabData(tab);
  }

  private getSelectedTabData(tab: ITab): (CommentDtoApi | QuestionSubmittedDtoApi)[] {
    switch (tab.value) {
      case ETabValue.PENDING:
        return [
          ...this.comments.filter((comment) => !comment.isRead),
          ...this.submittedQuestions.filter(
            ({ status }) => status === QuestionSubmittedDtoApiStatusEnumApi.Submitted,
          ),
        ];
      case ETabValue.ARCHIVED:
        return [
          ...this.comments.filter((comment) => comment.isRead),
          ...this.submittedQuestions.filter(
            ({ status }) => status !== QuestionSubmittedDtoApiStatusEnumApi.Submitted,
          ),
        ];
      case ETabValue.ALL:
        return [...this.comments, ...this.submittedQuestions];
    }
  }
}
