import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AddUsersForm } from '../../../models/user.model';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { TeamDtoApi, UserDtoCreatedResponseApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';

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

  constructor(
    private readonly userStore: ProfileStore,
    public activeOffcanvas: NgbActiveOffcanvas,
    readonly fob: UntypedFormBuilder,
    private readonly teamService: TeamsRestService,
    private readonly usersRestService: UsersRestService,
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

    this.addLine();
  }

  getForm() {
    return this.fb.group<AddUsersForm>({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      teamId: [undefined, [Validators.required]],
      email: ['', [Validators.required]],
      companyId: [this.userStore.user.value.companyId],
    });
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
}
