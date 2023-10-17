import { Component, EventEmitter, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { IFormBuilder } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-add-users',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss'],
})
export class AddUsersComponent {
  @Output() createdUsers = new EventEmitter<boolean>();

  private fb: IFormBuilder = this.fob;

  I18ns = I18ns;

  constructor(public activeOffcanvas: NgbActiveOffcanvas, readonly fob: UntypedFormBuilder) {}
}
