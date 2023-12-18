import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CommentDtoApi, QuestionLightDtoApi } from '@usealto/sdk-ts-angular';
import { of, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { ToastService } from 'src/app/core/toast/toast.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ReplaceInTranslationPipe } from 'src/app/core/utils/i18n/replace-in-translation.pipe';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { CommentsRestService } from 'src/app/modules/programs/services/comments-rest.service';
import { QuestionsRestService } from 'src/app/modules/programs/services/questions-rest.service';
import { QuestionFormComponent } from 'src/app/modules/shared/components/question-form/question-form.component';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { IAppData } from '../../../../core/resolvers';
import { CollaborationModalComponent } from '../collaboration-modal/collaboration-modal.component';

@UntilDestroy()
@Component({
  selector: 'alto-comment-card',
  templateUrl: './comment-card.component.html',
  styleUrls: ['./comment-card.component.scss', '../styles/collaboration-cards.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class CommentCardComponent implements OnInit {
  @Input() comment?: CommentDtoApi;
  @Output() refresh = new EventEmitter<boolean>();

  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  users!: Map<string, User>;
  teams!: Map<string, Team>;

  constructor(
    private readonly modalService: NgbModal,
    private readonly commentsRestService: CommentsRestService,
    private readonly toastService: ToastService,
    private readonly replaceInTranslationPipe: ReplaceInTranslationPipe,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly questionRestService: QuestionsRestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.users = (data[EResolvers.AppResolver] as IAppData).userById;
    this.teams = (data[EResolvers.AppResolver] as IAppData).teamById;
  }

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

  getTeam(userId: string): Team | undefined {
    const u = this.users.get(userId);
    return this.teams.get(u?.teamId || '');
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
              canvasRef.componentInstance.createdQuestion.subscribe();
            }
          }),
        )
        .subscribe();
    }
  }
}
