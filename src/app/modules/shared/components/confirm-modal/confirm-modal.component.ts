import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export interface IConfirmModalData {
  title: string;
  subtitle: string;
  confirmText: string;
  cancelText?: string;
  icon?: string;
}

@Component({
  selector: 'alto-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent {
  @Input() data!: IConfirmModalData;

  constructor(private activeModal: NgbActiveModal) {}

  exit(confirm = false): void {
    this.activeModal.close(confirm);
  }
}
