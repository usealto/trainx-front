import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentDtoApi, QuestionSubmittedDtoApi } from '@usealto/sdk-ts-angular';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
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

  submittedQuestion!: QuestionSubmittedDtoApi;
  comments: CommentDtoApi[] = [];

  isLoading = true;
  breadCrumbElem = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly commentsRestService: CommentsRestService,
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        map((p) => {
          return p['id'];
        }),
        switchMap((id) =>
          combineLatest([
            this.questionsSubmittedRestService.getQuestion(id),
            this.commentsRestService.getComments({ questionId: id }),
          ]),
        ),
        tap({
          next: ([question, comments]) => {
            if (question) {
              console.log(this.route.firstChild);
              console.log(question);
              console.log(comments);
              this.comments = comments;
              this.submittedQuestion = question;
              this.isLoading = false;
            } else {
              this.router.navigate(['/', AltoRoutes.notFound]);
            }
          },
          error: () => {
            this.router.navigate(['/', AltoRoutes.notFound]);
          },
        }),
      )
      .subscribe();
  }
}
