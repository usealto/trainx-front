import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AddUsersForm } from '../../../models/user.model';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { TeamDtoApi, UserDtoCreatedResponseApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ValidationService } from 'src/app/modules/shared/services/validation.service';
import { IAbstractControl } from 'src/app/core/form-types/i-abstract-control';

@Component({
  selector: 'alto-add-users',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss'],
})
export class AddUsersComponent implements OnInit {
  I18ns = I18ns;

  @Output() createdUsers = new EventEmitter<boolean>();

  private fb: IFormBuilder = this.fob;

  userForms: IFormGroup<AddUsersForm>[] = [];
  teams: TeamDtoApi[] = [];
  emails: string[] = [];

  constructor(
    private readonly userStore: ProfileStore,
    public activeOffcanvas: NgbActiveOffcanvas,
    readonly fob: UntypedFormBuilder,
    private readonly teamService: TeamsRestService,
    private readonly usersRestService: UsersRestService,
    private readonly validationService: ValidationService,
  ) {}

  ngOnInit(): void {
    this.teamService
      .getTeams()
      .pipe(
        tap((teams) => {
          this.teams = teams;
        }),
      )
      .subscribe();

    this.emails = this.userStore.users.value.map((u) => u.email);
    this.addLine();
  }

  getForm() {
    const userForm = this.fb.group<AddUsersForm>({
      firstname: [undefined, [Validators.required]],
      lastname: [undefined, [Validators.required]],
      teamId: [undefined, [Validators.required]],
      email: [
        undefined,
        [Validators.required, this.validationService.uniqueStringValidation(this.emails), Validators.email],
      ],
      companyId: [this.userStore.user.value.companyId],
    });

    return userForm;
  }

  sendForm() {
    let check = true;
    this.userForms.forEach((f) => {
      f.markAllAsTouched();
      check = !f.valid ? false : check;
    });

    const userErrors: UserDtoCreatedResponseApi[] = [];
    if (check) {
      this.userForms.forEach((f) => {
        if (f.value) {
          this.usersRestService
            .createUser(f.value)
            .pipe(tap((u) => userErrors.push(u)))
            .subscribe();
        }
      });
    }
  }

  addLine() {
    this.userForms.push(this.getForm());
  }

  removeLine(index: number) {
    this.userForms.splice(index, 1);
  }

  isTouchedAndInvalid(control: IAbstractControl<string | undefined, AddUsersForm>) {
    return control.touched && control.invalid;
  }
}
