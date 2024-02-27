import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

interface ModalData {
  title: string;
  subtitle: string;
}

@Component({
  selector: 'alto-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.scss'],
})
export class DeleteModalComponent {
  I18ns = I18ns;

  @Input() data?: ModalData;

  @Output() objectDeleted = new EventEmitter<void>();

  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {
    this.activeModal.close();
  }

  deleteObject() {
    this.objectDeleted.emit();
    this.activeModal.close();
  }
}
