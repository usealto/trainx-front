import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


interface ModalData {
  title: string;
  subtitle: string;
  icon?: string;
  color: string;
  button: string;
  textarea: string;
}

@Component({
  selector: 'alto-sugg-question-refuse-modal',
  templateUrl: './sugg-question-refuse-modal.component.html',
  styleUrls: ['./sugg-question-refuse-modal.component.scss']
})
export class SuggQuestionRefuseModalComponent {
  @Input() data?: ModalData;
  icon = this.data?.icon || 'bi-x-circle';
  @Output() objectDeleted = new EventEmitter<void>();

  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {
    this.activeModal.close();
  }

  refuseQuestion() {
    this.objectDeleted.emit();
  }
}
