import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

interface ModalData {
  title: string;
  subtitle: string;
  icon: string;
  color:
    | 'badge-double-primary'
    | 'badge-double-warning'
    | 'badge-double-success'
    | 'badge-double-gray'
    | 'badge-double-error'
    | 'badge-double-purple';
  confirmButtonLabel: string;
  textarea: string;
}

@Component({
  selector: 'alto-collaboration-modal',
  templateUrl: './collaboration-modal.component.html',
  styleUrls: ['./collaboration-modal.component.scss'],
})
export class CollaborationModalComponent {
  @Input() data: ModalData = {
    title: '',
    subtitle: '',
    icon: '',
    color: 'badge-double-gray',
    confirmButtonLabel: '',
    textarea: '',
  };
  icon = this.data.icon || 'bi-x-circle';
  @Output() objectDeleted = new EventEmitter<string>();

  response: FormControl<string> = new FormControl();

  I18ns = I18ns;

  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {
    this.activeModal.close();
  }

  confirm() {
    this.objectDeleted.emit(this.response.value);
  }
}
