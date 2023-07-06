import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { QuestionDtoApi } from '@usealto/sdk-ts-angular';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-question-delete-modal',
  templateUrl: './question-delete-modal.component.html',
  styleUrls: ['./question-delete-modal.component.scss'],
})
export class QuestionDeleteModalComponent {
  I18ns = I18ns;
  @Input() question?: QuestionDtoApi;

  @Output() questionDeleted = new EventEmitter<void>();

  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {
    this.activeModal.close();
  }

  deleteQuestion() {
    this.questionDeleted.emit();
  }
}
