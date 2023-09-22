import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommentDtoApi } from '@usealto/sdk-ts-angular';
import { format } from 'date-fns';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { QuestionsRestService } from 'src/app/modules/programs/services/questions-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ArchiveModalComponent } from '../archive-modal/archive-modal.component';
import { ToastService } from 'src/app/core/toast/toast.service';
import { getLocaleDateFormat } from '@angular/common';
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
    @Inject(LOCALE_ID) public locale: string,
    private modalService: NgbModal,
    private readonly toastService: ToastService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly questionRestSerive: QuestionsRestService,
    private readonly commentsRestService: CommentsRestService,
  ) {}

  ngOnInit(): void {
    this.getComments();
  }

  getComments(): void {
    this.route.params
      .pipe(
        map((p) => {
          return p['id'];
        }),
        switchMap((id) =>
          combineLatest([
            this.questionRestSerive.getQuestion(id),
            this.commentsRestService.getComments({ questionId: id }, true),
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
    const today = format(new Date(), getLocaleDateFormat(this.locale, 0));
    const commentDate = format(date, getLocaleDateFormat(this.locale, 0));

    if (today === commentDate) {
      return I18ns.collaboration.seeQuestion.date.today;
    } else {
      return commentDate;
    }
  }

  archiveComment(id: string) {
    const modalRef = this.modalService.open(ArchiveModalComponent, { centered: true, size: 'md' });

    const componentInstance = modalRef.componentInstance as ArchiveModalComponent;
    const comment = this.comments.find((c) => c.id === id);
    const author = comment ? comment.createdByUser.firstname + ' ' + comment.createdByUser.lastname : '';
    componentInstance.author = author;

    componentInstance.archivedComment
      .pipe(
        switchMap((answer) =>
          this.commentsRestService.updateComment({
            id,
            patchCommentDtoApi: { isRead: true, response: answer },
          }),
        ),
        tap(() => {
          this.getComments();
          modalRef.close();
          this.toastService.show({
            text: I18ns.collaboration.archiveModal.successToast,
            type: 'success',
          });
        }),
      )
      .subscribe();
  }
}
