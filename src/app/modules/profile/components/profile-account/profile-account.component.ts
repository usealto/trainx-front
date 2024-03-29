import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { ToastService } from 'src/app/core/toast/toast.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Company, ICompany } from 'src/app/models/company.model';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { UserForm } from '../../models/user.form';
import { UsersRestService } from '../../services/users-rest.service';
import { IAppData } from 'src/app/core/resolvers';

@UntilDestroy()
@Component({
  selector: 'alto-profile-account',
  templateUrl: './profile-account.component.html',
  styleUrls: ['./profile-account.component.scss'],
})
export class ProfileAccountComponent implements OnInit {
  EmojiName = EmojiName;

  I18ns = I18ns;
  private fb: IFormBuilder;

  userForm!: IFormGroup<UserForm>;
  user!: User;
  userTeam!: Team;
  company!: Company;

  constructor(
    readonly fob: UntypedFormBuilder,
    private readonly userRestService: UsersRestService,
    private readonly toastService: ToastService,
    private readonly resolversService: ResolversService,
    private readonly activatedRoute: ActivatedRoute,
  ) {
    this.fb = fob;
  }

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.user = (data[EResolvers.AppResolver] as IAppData).me;
    this.company = (data[EResolvers.AppResolver] as IAppData).company;
    this.userTeam = this.user.teamId
      ? this.company.teams.find((t) => t.id === this.user.teamId) || ({} as Team)
      : ({} as Team);
    this.initForm();
  }

  initForm() {
    this.userForm = this.fb.group<UserForm>({
      firstname: [this.user.firstname ?? '', [Validators.required]],
      lastname: [this.user.lastname ?? '', [Validators.required]],
      // timezone: [''],
      // country: [''],
    });
  }

  save() {
    this.userRestService
      .patchUser(this.user.id, {
        firstname: this.userForm.value?.firstname,
        lastname: this.userForm.value?.lastname,
      })
      .pipe(
        tap((u) => (this.user = u)),
        tap(() => {
          this.toastService.show({
            text: I18ns.profile.profile.form.success,
            type: 'success',
          });
          this.userForm.markAsUntouched();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  reset() {
    this.initForm();
  }
}
