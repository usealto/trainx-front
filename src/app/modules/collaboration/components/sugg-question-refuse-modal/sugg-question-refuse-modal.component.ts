import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
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
  @Input() data: ModalData = {
    title: '',
    subtitle: '',
    color: '',
    button: '',
    textarea: '',
  }
  icon = this.data.icon || 'bi-x-circle';
  @Output() objectDeleted = new EventEmitter<string>();

  response: FormControl<string> = new FormControl();

  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {
    this.activeModal.close();
  }

  refuseQuestion() {
    this.objectDeleted.emit(this.response.value);
  }
}
