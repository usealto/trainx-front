import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as Papa from 'papaparse';
import { tap } from 'rxjs';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { CompanyApi, TeamApi, UserApi } from 'src/app/sdk';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import { UserCreate } from './models/user.create';

@Component({
  selector: 'alto-admin-users-upload',
  templateUrl: './admin-users-upload.component.html',
  styleUrls: ['./admin-users-upload.component.scss']
})
export class AdminUsersUploadComponent implements OnInit {
  csvData: UserCreate[] = [];
  id!: string;
  company!: CompanyApi;
  teams: TeamApi[] = []; 
  reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  usersFailed: string[] = [];

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
        results.data.forEach((userRow: string[]) => {
          if (this.reg.test(userRow[0])) {
            const user = {
              email: userRow[0],
              teamId: this.findSelectedTeam(userRow[1]),
              companyId: this.id,
              isUploaded: false
            };
            this.csvData.push(user);
          }else{
            this.usersFailed.push(userRow[0]);
          }
        });
        if (this.csvData && this.csvData[0] && this.csvData[0].email === 'email') {
          this.csvData = this.csvData.slice(1);
        }

      }
    });
  }

  upload() {
    console.log('here');
    
    let yourJWTToken = localStorage.getItem('@@auth0spajs@@::ThcIBQZrRso5QaZq67kCU5eFYTfZwTSK::https://api.usealto.com::openid profile email offline_access') || '';
    yourJWTToken = JSON.parse(yourJWTToken).body.access_token  
    console.log(yourJWTToken);

    this.csvData.forEach((user) => {
      console.log(user);
      // const $this = this;
          
      axios.post(environment.apiURL+'/v1/users',{
        email: user.email,
        companyId: this.id,
        teamId: user.teamId,
      },
      {
        headers: {
          Authorization: "Bearer " + yourJWTToken
        }
      })
      .then(function (response:any) {
        console.log(response);
        user.isUploaded = true;
      })
      .catch(function (error:any) {
        console.log(error);
      });
    });
  }


  findSelectedTeam(teamName: string) {
    return this.teams.find(team => team.shortName === teamName)?.id
  }
  
}
