import { Component, OnInit } from '@angular/core';
import { CommentDtoApi, QuestionSubmittedDtoApi, QuestionSubmittedDtoApiStatusEnumApi, QuestionSubmittedStatusEnumApi } from '@usealto/sdk-ts-angular';
import { combineLatest } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';

enum ETabValue {
  PENDING = 'pending',
  ARCHIVED = 'archived',
  ALL = 'all',
}

const labels = {
  [ETabValue.PENDING]: 'En attente',
  [ETabValue.ARCHIVED]: 'Archivés',
  [ETabValue.ALL]: 'Tout voir',
};

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
    { label: labels[ETabValue.PENDING], value: ETabValue.PENDING },
    { label: labels[ETabValue.ARCHIVED], value: ETabValue.ARCHIVED },
    { label: labels[ETabValue.ALL], value: ETabValue.ALL },
  ];
  selectedTab = this.tabs[0];

  comments: CommentDtoApi[] = [];
  submittedQuestions: QuestionSubmittedDtoApi[] = [];
  selectedTabData: (CommentDtoApi | QuestionSubmittedDtoApi)[] = [];
  contributors: { id: string; name: string; }[] = [];

  pendingCount = 0;

  constructor(
    private readonly commentsRestService: CommentsRestService,
    private readonly questionsSubmittedTestService: QuestionsSubmittedRestService
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.commentsRestService.getComments(),
      this.questionsSubmittedTestService.getQuestions(),
    ])
    .subscribe(([comments, submittedQuestions]) => {
      this.comments = comments;
      this.submittedQuestions = submittedQuestions;
      this.pendingCount = comments.filter((comment) => !comment.isRead).length +
        submittedQuestions.filter(({ status }) => status === QuestionSubmittedDtoApiStatusEnumApi.Submitted).length;

      this.contributors = [
        ...comments.map(({ createdByUser }) => createdByUser),
        ...submittedQuestions.map(({ createdByUser }) => createdByUser),
      ].reduce((acc, contributor) => {
        if (!acc.find(({ id }) => id === contributor.id)) {
          acc.push({ id: contributor.id, name: `${contributor.firstname} ${contributor.lastname}`});
        }

        return acc;
      }, [] as { id: string; name: string; }[]);
    });
  }

  handleTabChange(tab: ITab): void {
    this.selectedTab = tab;

    this.selectedTabData = this.getSelectedTabData(tab);
    this.sort();
  }

  sort(): void {
    this.selectedTabData.sort(this.sortByCreatedAt);
  }

  private sortByCreatedAt(a: CommentDtoApi | QuestionSubmittedDtoApi, b: CommentDtoApi | QuestionSubmittedDtoApi): number {
    if (a.createdAt > b.createdAt) {
      return -1;
    }

    if (a.createdAt < b.createdAt) {
      return 1;
    }

    return 0;
  }

  private getSelectedTabData(tab: ITab): (CommentDtoApi | QuestionSubmittedDtoApi)[] {
    switch (tab.value) {
      case ETabValue.PENDING:
        return [
          ...this.comments.filter((comment) => !comment.isRead),
          ...this.submittedQuestions.filter(({ status }) => status === QuestionSubmittedDtoApiStatusEnumApi.Submitted),
        ];
      case ETabValue.ARCHIVED:
        return [
          ...this.comments.filter((comment) => comment.isRead),
          ...this.submittedQuestions.filter(({ status }) => status !== QuestionSubmittedDtoApiStatusEnumApi.Submitted),
        ];
      case ETabValue.ALL:
        return [
          ...this.comments,
          ...this.submittedQuestions,
        ];
    }
  }
}
