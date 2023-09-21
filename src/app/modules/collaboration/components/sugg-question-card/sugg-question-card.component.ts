import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  PatchQuestionSubmittedDtoApiStatusEnumApi,
  QuestionSubmittedDtoApi,
  QuestionSubmittedDtoApiStatusEnumApi,
} from '@usealto/sdk-ts-angular';
import { of, switchMap, tap } from 'rxjs';
import { ToastService } from 'src/app/core/toast/toast.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { SuggQuestionRefuseModalComponent } from '../sugg-question-refuse-modal/sugg-question-refuse-modal.component';
import { QuestionsSubmittedRestService } from './../../../programs/services/questions-submitted-rest.service';

@UntilDestroy()
@Component({
  selector: 'alto-sugg-question-card',
  templateUrl: './sugg-question-card.component.html',
  styleUrls: ['./sugg-question-card.component.scss'],
})
export class SuggQuestionCardComponent {
  @Input() suggQuestion?: QuestionSubmittedDtoApi;
  @Output() refresh = new EventEmitter<boolean>();

  I18n = I18ns;
  StatusEnum = QuestionSubmittedDtoApiStatusEnumApi;

  constructor(
    private readonly modalService: NgbModal,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly toastService: ToastService,
  ) {}

  refuseQuestion() {
    const fullname = `${this.suggQuestion?.createdByUser.firstname} ${this.suggQuestion?.createdByUser.lastname}`;

    const modalRef = this.modalService.open(SuggQuestionRefuseModalComponent, {
      centered: true,
      size: 'md',
    });

    const componentInstance = modalRef.componentInstance as SuggQuestionRefuseModalComponent;
    componentInstance.data = {
      title: 'Refuser une question',
      subtitle: `Souhaitez-vous envoyer un message à ${fullname} pour expliquer votre choix ?`,
      icon: 'bi-x-circle',
      color: 'badge-double-error',
      button: 'Refuser ',
      textarea: `Réponse à ${fullname} (facultatif)`,
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
            text: I18ns.collaboration.declineSuggestedQuestion,
            type: 'success',
          });
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  createQuestion() {
    // ! TODO
    console.log('TODO : action to develop');
  }
}
