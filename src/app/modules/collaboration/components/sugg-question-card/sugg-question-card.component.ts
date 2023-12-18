import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  PatchQuestionSubmittedDtoApiStatusEnumApi,
  QuestionSubmittedDtoApi,
  QuestionSubmittedDtoApiStatusEnumApi,
  TeamLightDtoApi,
} from '@usealto/sdk-ts-angular';
import { of, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { ToastService } from 'src/app/core/toast/toast.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ReplaceInTranslationPipe } from 'src/app/core/utils/i18n/replace-in-translation.pipe';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { QuestionFormComponent } from 'src/app/modules/shared/components/question-form/question-form.component';
import { IAppData } from '../../../../core/resolvers';
import { CollaborationModalComponent } from '../collaboration-modal/collaboration-modal.component';
import { QuestionsSubmittedRestService } from './../../../programs/services/questions-submitted-rest.service';

@UntilDestroy()
@Component({
  selector: 'alto-sugg-question-card',
  templateUrl: './sugg-question-card.component.html',
  styleUrls: ['./sugg-question-card.component.scss', '../styles/collaboration-cards.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class SuggQuestionCardComponent implements OnInit {
  @Input() suggQuestion?: QuestionSubmittedDtoApi;
  @Output() refresh = new EventEmitter<boolean>();

  I18ns = I18ns;
  StatusEnum = QuestionSubmittedDtoApiStatusEnumApi;
  users: Map<string, User> = new Map();
  teams: Map<string, Team> = new Map();

  constructor(
    private readonly modalService: NgbModal,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly toastService: ToastService,
    private readonly replaceInTranslationPipe: ReplaceInTranslationPipe,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.users = (data[EResolvers.AppResolver] as IAppData).userById;
    this.teams = (data[EResolvers.AppResolver] as IAppData).teamById;
  }

  refuseQuestion() {
    const fullname = this.suggQuestion?.author
      ? `${this.suggQuestion.author.firstname} ${this.suggQuestion.author.lastname}`
      : I18ns.shared.deletedUsername;

    const modalRef = this.modalService.open(CollaborationModalComponent, {
      centered: true,
      size: 'md',
    });

    const componentInstance = modalRef.componentInstance as CollaborationModalComponent;
    componentInstance.data = {
      title: I18ns.collaboration.questionCard.denyQuestionTitle,
      subtitle: this.replaceInTranslationPipe.transform(
        I18ns.collaboration.questionCard.denyQuestionSubtitle,
        fullname,
      ),
      icon: 'bi-x-circle',
      color: 'badge-double-error',
      confirmButtonLabel: I18ns.collaboration.questionCard.deny,
      textarea: this.replaceInTranslationPipe.transform(I18ns.collaboration.questionCard.textArea, fullname),
    };

    componentInstance.objectDeleted
      .pipe(
        switchMap((response) => {
          if (this.suggQuestion) {
            return this.questionsSubmittedRestService.update({
              id: this.suggQuestion.id,
              patchQuestionSubmittedDtoApi: {
                status: PatchQuestionSubmittedDtoApiStatusEnumApi.Declined,
                response,
              },
            });
          }
          return of(null);
        }),
        tap(() => {
          modalRef.close();
          this.refresh.emit(true);
          this.toastService.show({
            text: I18ns.collaboration.questionCard.suggQuestionDenied,
            type: 'success',
          });
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  createQuestion(question: QuestionSubmittedDtoApi | undefined) {
    const canvasRef = this.offcanvasService.open(QuestionFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });
    const instance = canvasRef.componentInstance as QuestionFormComponent;
    instance.createdQuestion;
    instance.questionSubmitted = question;
    instance.isSubmitted = true;

    canvasRef.componentInstance.createdQuestion
      .pipe(
        tap((createdQuestion) => {
          this.refresh.emit(!!createdQuestion);
        }),
      )
      .subscribe();
  }

  getTeam(userId: string): TeamLightDtoApi | undefined {
    const u = this.users.get(userId);
    return this.teams.get(u?.teamId || '');
  }
}
