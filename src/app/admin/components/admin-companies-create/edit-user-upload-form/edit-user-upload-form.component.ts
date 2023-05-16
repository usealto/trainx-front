import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { UserDtoApiRolesEnumApi } from 'src/app/sdk';

@Component({
  selector: 'alto-edit-user-upload-form',
  templateUrl: './edit-user-upload-form.component.html',
  styleUrls: ['./edit-user-upload-form.component.scss'],
})
export class EditUserUploadFormComponent {
  @Input() user: any;
  private fb: IFormBuilder;
  rolesPossibleValues = Object.keys(UserDtoApiRolesEnumApi);
  userForm!: IFormGroup<any>;

  constructor(public activeOffcanvas: NgbActiveOffcanvas, readonly fob: UntypedFormBuilder) {
    this.fb = fob;
  }
  ngOnInit(): void {
    this.userForm = this.fb.group<any>({
      firstname: [this.user.firstname, [Validators.required]],
      lastname: [this.user.lastname, [Validators.required]],
      email: [this.user.email, [Validators.email, Validators.required]],
      role: [this.user.role],
    });
  }
}
