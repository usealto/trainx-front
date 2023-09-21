import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  PatchQuestionSubmittedDtoApiStatusEnumApi,
  QuestionDtoApi,
  QuestionSubmittedDtoApi,
  QuestionSubmittedDtoApiStatusEnumApi,
} from '@usealto/sdk-ts-angular';
import { of, switchMap, tap } from 'rxjs';
import { ToastService } from 'src/app/core/toast/toast.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { SuggQuestionRefuseModalComponent } from '../sugg-question-refuse-modal/sugg-question-refuse-modal.component';
import { QuestionsSubmittedRestService } from './../../../programs/services/questions-submitted-rest.service';
import { ReplaceInTranslationPipe } from 'src/app/core/utils/i18n/replace-in-translation.pipe';
import { QuestionFormComponent } from 'src/app/modules/programs/components/questions/question-form/question-form.component';

@UntilDestroy()
@Component({
  selector: 'alto-sugg-question-card',
  templateUrl: './sugg-question-card.component.html',
  styleUrls: ['./sugg-question-card.component.scss'],
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
    const fullname = `${this.suggQuestion?.createdByUser.firstname} ${this.suggQuestion?.createdByUser.lastname}`;

    const modalRef = this.modalService.open(SuggQuestionRefuseModalComponent, {
      centered: true,
      size: 'md',
    });

    const componentInstance = modalRef.componentInstance as SuggQuestionRefuseModalComponent;
    componentInstance.data = {
      title: I18ns.collaboration.questionCard.denyQuestionTitle,
      subtitle: this.replaceInTranslationPipe.transform(
        I18ns.collaboration.questionCard.denyQuestionSubtitle,
        fullname,
      ),
      icon: 'bi-x-circle',
      color: 'badge-double-error',
      button: I18ns.collaboration.questionCard.deny,
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
        tap(() => {
          // this.getQuestions();
          // this.tagRestService.resetTags();
          // this.getTags();
        }),
      )
      .subscribe();
  }
}
