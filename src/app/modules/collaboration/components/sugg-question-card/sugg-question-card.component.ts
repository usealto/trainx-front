import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  PatchQuestionSubmittedDtoApiStatusEnumApi,
  QuestionSubmittedDtoApi,
  QuestionSubmittedDtoApiStatusEnumApi,
} from '@usealto/sdk-ts-angular';
import { of, switchMap, tap } from 'rxjs';
import { ToastService } from 'src/app/core/toast/toast.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { QuestionsSubmittedRestService } from './../../../programs/services/questions-submitted-rest.service';
import { ReplaceInTranslationPipe } from 'src/app/core/utils/i18n/replace-in-translation.pipe';
import { CollaborationModalComponent } from '../collaboration-modal/collaboration-modal.component';
import { QuestionFormComponent } from 'src/app/modules/shared/components/question-form/question-form.component';

@UntilDestroy()
@Component({
  selector: 'alto-sugg-question-card',
  templateUrl: './sugg-question-card.component.html',
  styleUrls: ['./sugg-question-card.component.scss', '../styles/collaboration-cards.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class SuggQuestionCardComponent {
  @Input() suggQuestion?: QuestionSubmittedDtoApi;
  @Output() refresh = new EventEmitter<boolean>();

  I18ns = I18ns;
  StatusEnum = QuestionSubmittedDtoApiStatusEnumApi;

  constructor(
    private readonly modalService: NgbModal,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly toastService: ToastService,
    private readonly replaceInTranslationPipe: ReplaceInTranslationPipe,
    private readonly offcanvasService: NgbOffcanvas,
  ) {}

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

    canvasRef.componentInstance.createdQuestion.pipe().subscribe();
  }
}
