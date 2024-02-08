import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommentDtoApi } from '@usealto/sdk-ts-angular';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { QuestionsRestService } from 'src/app/modules/programs/services/questions-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ToastService } from 'src/app/core/toast/toast.service';
import { CollaborationModalComponent } from '../collaboration-modal/collaboration-modal.component';
import { ReplaceInTranslationPipe } from 'src/app/core/utils/i18n/replace-in-translation.pipe';
@Component({
  selector: 'alto-see-question',
  templateUrl: './see-question.component.html',
  styleUrls: ['./see-question.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class SeeQuestionComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

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
    private readonly replaceInTranslationPipe: ReplaceInTranslationPipe,
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
            this.questionRestSerive.getQuestionById(id),
            this.commentsRestService.getUnreadComments({ questionId: id }, true),
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

  archiveComment(id: string) {
    const modalRef = this.modalService.open(CollaborationModalComponent, { centered: true, size: 'md' });

    const componentInstance = modalRef.componentInstance as CollaborationModalComponent;
    const comment = this.comments.find((c) => c.id === id);
    const fullname = comment?.author
      ? `${comment?.author.firstname} ${comment?.author.lastname}`
      : I18ns.shared.deletedUsername;

    componentInstance.data = {
      title: I18ns.collaboration.commentCard.archiveCommentTitle,
      subtitle: this.replaceInTranslationPipe.transform(
        I18ns.collaboration.commentCard.archiveCommentSubtitle,
        fullname,
      ),
      icon: 'bi-archive',
      color: 'badge-double-primary',
      confirmButtonLabel: I18ns.collaboration.commentCard.archive,
      textarea: this.replaceInTranslationPipe.transform(I18ns.collaboration.commentCard.textArea, fullname),
    };

    componentInstance.objectDeleted
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
            text: I18ns.collaboration.commentCard.hasArchivedComment,
            type: 'success',
          });
        }),
      )
      .subscribe();
  }
}
