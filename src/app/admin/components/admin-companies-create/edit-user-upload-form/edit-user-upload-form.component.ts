import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';

@Component({
  selector: 'alto-edit-user-upload-form',
  templateUrl: './edit-user-upload-form.component.html',
  styleUrls: ['./edit-user-upload-form.component.scss'],
})
export class EditUserUploadFormComponent {
  @Input() user: any;
  private fb: IFormBuilder;
  userForm!: IFormGroup<any>;

  constructor(public activeOffcanvas: NgbActiveOffcanvas, readonly fob: UntypedFormBuilder) {
    this.fb = fob;
  }
  ngOnInit(): void {
    this.userForm = this.fb.group<any>({
      name: ['', [Validators.required]],
      email: [this.user.email, [Validators.email, Validators.required]],
      programs: [],
    });
  }
}
