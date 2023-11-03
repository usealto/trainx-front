import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
@Component({
  selector: 'alto-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent {
  I18ns = I18ns;

  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() validBtn!: string;
  @Output() next = new EventEmitter<string>();

  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {
    this.next.emit('abort');
  }

  confirm() {
    this.next.emit('next');
  }
}
