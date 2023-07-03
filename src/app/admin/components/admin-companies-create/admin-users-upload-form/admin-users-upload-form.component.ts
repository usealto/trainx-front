import { Component, Input } from '@angular/core';
import { DropzoneChangeEvent } from 'src/app/modules/shared/components/dropzone/dropzone.component';
import * as Papa from 'papaparse';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { EditUserUploadFormComponent } from '../edit-user-upload-form/edit-user-upload-form.component';
import { RoleEnumApi, UserDtoCreatedResponseApi, UsersApiService } from '@usealto/sdk-ts-angular';
import { UntypedFormGroup } from '@angular/forms';
import { Observable, catchError, combineLatest, of, take } from 'rxjs';

@Component({
  selector: 'alto-admin-users-upload-form',
  templateUrl: './admin-users-upload-form.component.html',
  styleUrls: ['./admin-users-upload-form.component.scss'],
})
export class AdminUsersUploadFormComponent {
  @Input() form?: UntypedFormGroup;

  displayedUsers: any[] = [];
  pageSize = 5;
  csvData: any[] = [];
  usersFailed: string[] = [];
  reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  page = 1;
  showUserList = true;
  id: any;

  constructor(
    private readonly offcanvasService: NgbOffcanvas,
    private readonly usersApiService: UsersApiService,
  ) {}

  ngOnInit(): void {
    this.resetComponent();
  }

  resetComponent(): void {
    this.csvData = [];
    this.displayedUsers = [];
    this.page = 1;
    this.usersFailed = [];
    this.refreshUsers();
  }

  openEditUserForm(user: any) {
    const userIndex = this.csvData.findIndex((csvUser) => csvUser.email === user.email);

    const canvasRef = this.offcanvasService.open(EditUserUploadFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.user = user;
    canvasRef.result.then(
      (result) => {
        // need to edit all users
        this.csvData[userIndex].email = result.email;

        this.csvData[userIndex].firstname = result.firstname;

        this.csvData[userIndex].lastname = result.lastname;

        this.csvData[userIndex].roles = result.roles;

        this.refreshUsers();
        this.form?.markAsDirty();
      },
      // (reason) => {},
    );
  }

  deleteUser(user: any) {
    this.csvData = this.csvData.filter((csvUser) => csvUser.email !== user.email);
    this.refreshUsers();
  }

  onSelectUser(event: DropzoneChangeEvent) {
    if (event.addedFiles.length > 0) {
      this.onFileSelected(event.addedFiles[0]);
    }
  }

  refreshUsers() {
    this.displayedUsers = this.csvData.slice(
      (this.page - 1) * this.pageSize,
      (this.page - 1) * this.pageSize + this.pageSize,
    );
  }

  private onFileSelected(file: File) {
    this.displayedUsers = [];
    this.csvData = [];
    this.usersFailed = [];
    Papa.parse(file, {
      complete: (results: { data: any[] }) => {
        results.data.forEach((userRow: string[]) => {
          if (
            this.reg.test(userRow[2]) &&
            Object.values(RoleEnumApi).includes(userRow[3] as unknown as RoleEnumApi)
          ) {
            const user = {
              firstname: userRow[0],
              lastname: userRow[1],
              email: userRow[2],
              roles: [userRow[3]],
            };
            this.csvData.push(user);
          } else {
            if (!userRow.every((item) => item === '')) {
              this.usersFailed.push(userRow[2]);
            }
          }
        });
        if (this.csvData && this.csvData[0] && this.csvData[0].email === 'email') {
          this.csvData = this.csvData.slice(1);
        }
        this.form?.markAsDirty();
        this.refreshUsers();
      },
    });
  }

  public upload(id: string | undefined): void {
    if (this.csvData.length > 0) {
      const obs = this.csvData.map((user) => {
        const roles = user.roles.flatMap((role: string) =>
          Object.values(RoleEnumApi).includes(role as unknown as RoleEnumApi)
            ? (role as unknown as RoleEnumApi)
            : [],
        );
        if (!roles.includes(RoleEnumApi.CompanyUser)) {
          roles.push(RoleEnumApi.CompanyUser);
        }
        return this.usersApiService
          .createUser({
            createUserDtoApi: {
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              companyId: id,
              roles: roles,
            },
          })
          .pipe(catchError(() => of(null)));
      });

      combineLatest(obs as Observable<UserDtoCreatedResponseApi>[])
        .pipe(take(1))
        .subscribe((res) => {
          this.resetComponent();
        });
    }
  }
}
