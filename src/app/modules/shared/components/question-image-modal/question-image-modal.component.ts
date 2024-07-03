import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { QuestionLightDtoApi } from '@usealto/sdk-ts-angular';

@Component({
  selector: 'alto-question-image-modal',
  templateUrl: './question-image-modal.component.html',
  styleUrls: ['./question-image-modal.component.scss'],
})
export class QuestionImageModalComponent {
  @Input() question?: QuestionLightDtoApi;

  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {
    this.activeModal.close();
  }
}
