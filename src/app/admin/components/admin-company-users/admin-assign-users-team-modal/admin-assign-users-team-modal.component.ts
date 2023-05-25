import { Component, Input } from '@angular/core';
import { DropzoneChangeEvent } from 'src/app/modules/shared/components/dropzone/dropzone.component';
import * as Papa from 'papaparse';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TeamDtoApi } from '@usealto/sdk-ts-angular';

@Component({
  selector: 'alto-admin-assign-users-team-modal',
  templateUrl: './admin-assign-users-team-modal.component.html',
  styleUrls: ['./admin-assign-users-team-modal.component.scss'],
})
export class AdminAssignUsersTeamModalComponent {
  @Input() teams: TeamDtoApi[] = [];

  csvData: any[] = [];
  usersFailed: string[] = [];
  reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  displayedUsers: any[] = [];
  page = 1;
  pageSize = 5;

  constructor(public modal: NgbActiveModal) {}

  onDropzoneEvent(event: DropzoneChangeEvent) {
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
          const team = this.findSelectedTeam(userRow[1]);
          if (this.reg.test(userRow[0]) && team) {
            const user = {
              email: userRow[0],
              team: team,
            };
            this.csvData.push(user);
          } else {
            this.usersFailed.push(userRow[0]);
          }
        });
        if (this.csvData && this.csvData[0] && this.csvData[0].email === 'email') {
          this.csvData = this.csvData.slice(1);
        }
        console.log(this.usersFailed);
        this.refreshUsers();
      },
    });
  }

  deleteUser(user: any) {
    this.csvData = this.csvData.filter((csvUser) => csvUser.email !== user.email);
    this.refreshUsers();
  }

  findSelectedTeam(teamName: string) {
    return this.teams.find((team) => team.shortName === teamName);
  }
}
