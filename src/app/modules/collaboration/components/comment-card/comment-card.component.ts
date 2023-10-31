import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { CommentDtoApi, QuestionDtoApi, QuestionLightDtoApi, TeamLightDtoApi } from '@usealto/sdk-ts-angular';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { CollaborationModalComponent } from '../collaboration-modal/collaboration-modal.component';
import { ReplaceInTranslationPipe } from 'src/app/core/utils/i18n/replace-in-translation.pipe';
import { of, switchMap, tap } from 'rxjs';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { ToastService } from 'src/app/core/toast/toast.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { QuestionFormComponent } from 'src/app/modules/shared/components/question-form/question-form.component';
import { QuestionsRestService } from 'src/app/modules/programs/services/questions-rest.service';

@UntilDestroy()
@Component({
  selector: 'alto-comment-card',
  templateUrl: './comment-card.component.html',
  styleUrls: ['./comment-card.component.scss', '../styles/collaboration-cards.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class CommentCardComponent {
  @Input() comment?: CommentDtoApi;
  @Output() refresh = new EventEmitter<boolean>();

  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  constructor(
    private readonly modalService: NgbModal,
    private readonly commentsRestService: CommentsRestService,
    private readonly toastService: ToastService,
    private readonly replaceInTranslationPipe: ReplaceInTranslationPipe,
    private readonly userStore: ProfileStore,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly questionRestService: QuestionsRestService,
  ) {}

  archiveComment(): void {
    const fullname = this.comment?.author
      ? `${this.comment?.author.firstname} ${this.comment?.author.lastname}`
      : I18ns.shared.deletedUsername;

    const modalRef = this.modalService.open(CollaborationModalComponent, { centered: true, size: 'md' });

    const componentInstance = modalRef.componentInstance as CollaborationModalComponent;
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
        switchMap((response) => {
          if (this.comment) {
            return this.commentsRestService.updateComment({
              id: this.comment.id,
              patchCommentDtoApi: { isRead: true, response },
            });
          }
          return of(null);
        }),
        tap(() => {
          modalRef.close();
          this.refresh.emit(true);
          this.toastService.show({
            text: I18ns.collaboration.commentCard.commentArchived,
            type: 'success',
          });
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  getTeam(userId: string): TeamLightDtoApi | undefined {
    const u = this.userStore.users.value.find((user) => user.id === userId);
    return u?.team || undefined;
  }

  openQuestionForm(question?: QuestionLightDtoApi) {
    if (question) {
      this.questionRestService
        .getQuestion(question.id)
        .pipe(
          tap((q) => {
            if (q) {
              const canvasRef = this.offcanvasService.open(QuestionFormComponent, {
                position: 'end',
                panelClass: 'overflow-auto',
              });
              canvasRef.componentInstance.question = q;
              canvasRef.componentInstance.createdQuestion
                .subscribe();
            }
          }),
        )
        .subscribe();
    }
  }
}
