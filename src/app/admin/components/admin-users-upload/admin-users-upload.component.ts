import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Papa from 'papaparse';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { CompanyApi, TeamApi } from 'src/app/sdk';

@Component({
  selector: 'alto-admin-users-upload',
  templateUrl: './admin-users-upload.component.html',
  styleUrls: ['./admin-users-upload.component.scss']
})
export class AdminUsersUploadComponent implements OnInit {
  csvData: string[] = [];
  id: string | undefined;
  company!: CompanyApi;
  teams: TeamApi[] = []; 
  reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  constructor(private readonly companiesRestService: CompaniesRestService, private readonly usersRestService: UsersRestService, private readonly teamsRestService:TeamsRestService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    
    this.companiesRestService.getCompanyById(this.id)
      .pipe(
        tap((company) => this.company = company)
      )
      .subscribe();

    this.teamsRestService.getTeams({companyId: this.id})
      .pipe(
        tap((teams) => this.teams = teams)
      )
      .subscribe();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    Papa.parse(file, {
      complete: (results: { data: any[]; }) => {
        this.csvData = results.data;
        if (this.csvData && this.csvData[0] && this.csvData[0][0] === 'email') {
          this.csvData = this.csvData.slice(1);
        }

      }
    });
  }


  findSelectedTeam(teamName: string) {
    return this.teams.find(team => team.shortName === teamName)?.id
  }
  
}
