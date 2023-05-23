import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';

@Component({
  selector: 'alto-change-status-selected-users-team-modal',
  templateUrl: './change-status-selected-users-team-modal.component.html',
  styleUrls: ['./change-status-selected-users-team-modal.component.scss'],
})
export class ChangeStatusSelectedUsersTeamModalComponent {
  private fb: IFormBuilder;
  statusForm!: IFormGroup<any>;

  constructor(public modal: NgbActiveModal, readonly fob: UntypedFormBuilder) {
    this.fb = fob;
  }

  ngOnInit(): void {
    this.statusForm = this.fb.group({
      activate: [],
      disable: [],
    });
  }
}
