import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentDtoApi, QuestionSubmittedDtoApi } from '@usealto/sdk-ts-angular';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { QuestionsRestService } from 'src/app/modules/programs/services/questions-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
@Component({
  selector: 'alto-see-question',
  templateUrl: './see-question.component.html',
  styleUrls: ['./see-question.component.scss'],
})
export class SeeQuestionComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;

  questionTitle = '';
  comments: CommentDtoApi[] = [];

  isLoading = true;
  breadCrumbElem = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly commentsRestService: CommentsRestService,
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        map((p) => {
          return p['id'];
        }),
        switchMap((id) => this.commentsRestService.getComments({ questionId: id })),
        tap({
          next: (comments) => {
            console.log(this.route.firstChild);
            this.questionTitle = comments[0].question.title;
            this.comments = comments;
            this.isLoading = false;
          },
          error: () => {
            this.router.navigate(['/', AltoRoutes.notFound]);
          },
        }),
      )
      .subscribe();
  }
}
