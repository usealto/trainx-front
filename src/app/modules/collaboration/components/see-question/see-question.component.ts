import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentDtoApi } from '@usealto/sdk-ts-angular';
import { format } from 'date-fns';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { QuestionsRestService } from 'src/app/modules/programs/services/questions-rest.service';
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
  breadcrumbElem = '';
  currentDay = new Date();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly questionRestSerive: QuestionsRestService,
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
            this.questionRestSerive.getQuestion(id),
            this.commentsRestService.getComments({ questionId: id }),
          ]),
        ),
        tap({
          next: ([question, comments]) => {
            if (question) {
              this.questionTitle = question.title;
            }
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

  getDate(date: Date): string {
    const today = format(new Date(), 'dd/MM/yyyy');
    const commentDate = format(date, 'dd/MM/yyyy');

    if (today === commentDate) {
      return I18ns.collaboration.seeQuestion.date.today;
    } else {
      return commentDate;
    }
  }

  archiveComment(id: string) {
    this.commentsRestService.updateComment({ id, patchCommentDtoApi: { isRead: true } }).subscribe();
  }
}
