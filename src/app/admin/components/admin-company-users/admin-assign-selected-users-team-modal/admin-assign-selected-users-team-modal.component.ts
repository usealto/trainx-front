import { Component, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TeamDtoApi } from '@usealto/sdk-ts-angular';

@Component({
  selector: 'alto-admin-assign-selected-users-team-modal',
  templateUrl: './admin-assign-selected-users-team-modal.component.html',
  styleUrls: ['./admin-assign-selected-users-team-modal.component.scss'],
})
export class AdminAssignSelectedUsersTeamModalComponent {
  @Input() teams: TeamDtoApi[] = [];
  selectedTeam = new FormControl('', Validators.required);
  constructor(public modal: NgbActiveModal) {}
}
