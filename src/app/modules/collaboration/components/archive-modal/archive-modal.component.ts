import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-archive-modal',
  templateUrl: './archive-modal.component.html',
  styleUrls: ['./archive-modal.component.scss'],
})
export class ArchiveModalComponent {
  I18ns = I18ns;

  @Input() author!: string;
  @Output() archivedComment = new EventEmitter<string>();

  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {
    this.activeModal.close();
  }
  archiveComment(answerText: any) {
    this.archivedComment.emit(answerText.value);
  }
}
