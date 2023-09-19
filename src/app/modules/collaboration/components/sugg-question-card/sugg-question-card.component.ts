import { QuestionsSubmittedRestService } from './../../../programs/services/questions-submitted-rest.service';
import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  PatchQuestionSubmittedDtoApiStatusEnumApi,
  QuestionSubmittedDtoApi,
  QuestionSubmittedDtoApiStatusEnumApi
} from '@usealto/sdk-ts-angular';
import { switchMap, tap } from 'rxjs';
import { SuggQuestionRefuseModalComponent } from '../sugg-question-refuse-modal/sugg-question-refuse-modal.component';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'alto-sugg-question-card',
  templateUrl: './sugg-question-card.component.html',
  styleUrls: ['./sugg-question-card.component.scss']
})
export class SuggQuestionCardComponent {
  @Input() suggQuestion: QuestionSubmittedDtoApi = {
    title: '',
    status: QuestionSubmittedDtoApiStatusEnumApi.Submitted,
    company: {
      id: '',
      name: '',
      usersHaveWebAccess: false,
    },
    companyId: '',
    id: '',
    createdAt: new Date(),
    createdBy: '',
    createdByUser: {
      id: '',
      firstname: '',
      lastname: '',
      email: '',
    },
    updatedAt: new Date(),
  };

  I18n = I18ns;

  constructor(
    private modalService: NgbModal,
    private QuestionsSubmittedRestService: QuestionsSubmittedRestService,
  ) { }

  refuseQuestion() {
    const fullname = `${this.suggQuestion.createdByUser.firstname} ${this.suggQuestion.createdByUser.lastname}`;

    const modalRef = this.modalService.open(SuggQuestionRefuseModalComponent, {
      centered: true,
      size: 'md'
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
        switchMap(() => {
          return this.QuestionsSubmittedRestService.update({
            id: this.suggQuestion.id,
            patchQuestionSubmittedDtoApi: {
              status: PatchQuestionSubmittedDtoApiStatusEnumApi.Declined,
            }
          });
        }),
        tap(() => modalRef.close()),
        untilDestroyed(this)
      )
      .subscribe();
  }

  createQuestion(){
    console.log('TODO : action to develop');
  }


}
