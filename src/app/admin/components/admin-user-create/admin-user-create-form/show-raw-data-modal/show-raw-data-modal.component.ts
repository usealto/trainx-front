import { Component, Input } from '@angular/core';
import { AuthUserGet } from '../../../admin-users/models/authuser.get';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'alto-show-raw-data-modal',
  templateUrl: './show-raw-data-modal.component.html',
  styleUrls: ['./show-raw-data-modal.component.scss'],
})
export class ShowRawDataModalComponent {
  @Input() userAuth0!: AuthUserGet;
  @Input() user!: UserDtoApi;
  constructor(public modal: NgbActiveModal) {}
}
