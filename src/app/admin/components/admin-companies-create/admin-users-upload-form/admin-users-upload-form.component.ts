import { Component } from '@angular/core';
import { DropzoneChangeEvent } from 'src/app/modules/shared/components/dropzone/dropzone.component';
import * as Papa from 'papaparse';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { EditUserUploadFormComponent } from '../edit-user-upload-form/edit-user-upload-form.component';
import { RoleEnumApi, UsersApiService } from 'src/app/sdk';

@Component({
  selector: 'alto-admin-users-upload-form',
  templateUrl: './admin-users-upload-form.component.html',
  styleUrls: ['./admin-users-upload-form.component.scss'],
})
export class AdminUsersUploadFormComponent {
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

        this.csvData[userIndex].role = result.role;

        this.refreshUsers();
      },
      (reason) => {},
    );
  }

  deleteUser(user: any) {
    this.csvData = this.csvData.filter((csvUser) => csvUser.email !== user.email);
    this.refreshUsers();
  }

  onSelectUser(event: DropzoneChangeEvent) {
    console.log(event);
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
    Papa.parse(file, {
      complete: (results: { data: any[] }) => {
        results.data.forEach((userRow: string[]) => {
          if (this.reg.test(userRow[2])) {
            const user = {
              firstname: userRow[0],
              lastname: userRow[1],
              email: userRow[2],
              role: userRow[3],
            };
            this.csvData.push(user);
          } else {
            this.usersFailed.push(userRow[0]);
          }
        });
        if (this.csvData && this.csvData[0] && this.csvData[0].email === 'email') {
          this.csvData = this.csvData.slice(1);
        }
        console.log(this.csvData);
        this.refreshUsers();
      },
    });
  }

  public upload(id: string | undefined): void {
    console.log('in upload');
    console.log(id);

    if (this.csvData.length > 0) {
      this.csvData.forEach((user) => {
        const roles =
          RoleEnumApi[user.role as keyof typeof RoleEnumApi] !== RoleEnumApi.CompanyUser
            ? [RoleEnumApi[user.role as keyof typeof RoleEnumApi], RoleEnumApi.CompanyUser]
            : [RoleEnumApi[user.role as keyof typeof RoleEnumApi]];
        this.usersApiService
          .createUser({
            createUserDtoApi: {
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              companyId: id,
              roles: roles,
            },
          })
          .subscribe((res) => {
            console.log(res);
            if (res.statusCode === 201) {
              user.isUploaded = true;
            }
          });
      });
    }
  }
}
