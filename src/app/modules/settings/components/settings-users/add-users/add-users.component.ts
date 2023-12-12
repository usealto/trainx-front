import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { catchError, combineLatest, of, switchMap, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { IAbstractControl } from 'src/app/core/form-types/i-abstract-control';
import { ToastService } from 'src/app/core/toast/toast.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Team } from 'src/app/models/team.model';
import { IUser, User } from 'src/app/models/user.model';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ValidationService } from 'src/app/modules/shared/services/validation.service';
import { AddUsersForm } from '../../../models/user.model';

@Component({
  selector: 'alto-add-users',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss'],
})
export class AddUsersComponent implements OnInit {
  I18ns = I18ns;

  @Input() me: User = new User({} as IUser);
  @Input() teams: Team[] = [];
  @Output() createdUsers = new EventEmitter<boolean>();

  private fb: IFormBuilder = this.fob;

  userForms: IFormGroup<AddUsersForm>[] = [];
  emails: string[] = [];
  deletedEmails: string[] = [];

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    readonly fob: UntypedFormBuilder,
    private readonly usersRestService: UsersRestService,
    private readonly validationService: ValidationService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.usersRestService
      .getUsersCount({ includeSoftDeleted: true })
      .pipe(
        switchMap((count) =>
          this.usersRestService.getUsersFiltered({
            includeSoftDeleted: true,
            itemsPerPage: count,
          }),
        ),
        tap((users) => {
          this.emails = users.filter((u) => !u.deletedAt).map((u) => u.email);
          this.deletedEmails = users.filter((u) => u.deletedAt).map((u) => u.email);
          this.addLine();
        }),
      )
      .subscribe();
  }

  getForm() {
    const userForm = this.fb.group<AddUsersForm>({
      firstname: [undefined, [Validators.required]],
      lastname: [undefined, [Validators.required]],
      teamId: [undefined, [Validators.required]],
      email: [
        undefined,
        [
          Validators.required,
          this.validationService.uniqueStringValidation(this.emails, 'nameNotAllowed'),
          this.validationService.uniqueStringValidation(this.deletedEmails, 'emailDeleted'),
          Validators.email,
        ],
      ],
      companyId: [this.me.companyId],
    });

    return userForm;
  }

  sendForm() {
    let check = true;
    this.userForms.forEach((f) => {
      f.markAllAsTouched();
      check = !f.valid ? false : check;
    });

    const validUsers: Map<number, AddUsersForm> = new Map();
    if (check) {
      const obs$ = this.userForms.map((f, index) => {
        if (f.value) {
          validUsers.set(index, f.value);
          return this.usersRestService
            .createUser({
              firstname: f.value.firstname ?? '',
              lastname: f.value.lastname ?? '',
              teamId: f.value.teamId ?? '',
              email: f.value.email ?? '',
              companyId: f.value.companyId,
            })
            .pipe(
              catchError((err) => {
                validUsers.delete(index);
                return of(err);
              }),
            );
        }
        return of(null);
      });
      combineLatest(obs$)
        .pipe(
          tap(() => {
            const tmpArr: number[] = [];
            validUsers.forEach((user, key) => tmpArr.push(key));

            // We reverse keys order to remove lines from the end and keep the index
            tmpArr.reverse().forEach((key) => {
              this.removeLine(key);
            });

            if (this.userForms.length > 0) {
              this.toastService.show({
                text: I18ns.settings.users.addUsers.APIerror,
                type: 'danger',
                autoHide: false,
              });
            } else {
              this.toastService.show({
                text: I18ns.settings.users.addUsers.success,
                type: 'success',
                autoHide: false,
              });
              this.createdUsers.emit(true);
              this.activeOffcanvas.close();
            }
          }),
        )
        .subscribe();
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
