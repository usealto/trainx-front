import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TagDtoApi } from '@usealto/sdk-ts-angular';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-tag-delete-modal',
  templateUrl: './tag-delete-modal.component.html',
  styleUrls: ['./tag-delete-modal.component.scss'],
})
export class TagDeleteModalComponent {
  I18ns = I18ns;
  @Input() tag?: TagDtoApi;

  @Output() tagDeleted = new EventEmitter<void>();

  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {
    this.activeModal.close();
  }

  deleteTag() {
    this.tagDeleted.emit();
  }
}
