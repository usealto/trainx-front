import { TeamApi, UsersApiService } from 'src/app/sdk';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { UserForm } from './models/user.form';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { UntypedFormBuilder } from '@angular/forms';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'alto-admin-user-create-form',
  templateUrl: './admin-user-create-form.component.html',
  styleUrls: ['./admin-user-create-form.component.scss']
})
export class AdminUserCreateFormComponent implements OnInit {
  id!: string;
  teams: TeamApi[] = [];
  userForm!: IFormGroup<UserForm>;
  private fb: IFormBuilder;

  constructor(private router: Router, private route: ActivatedRoute, private usersApiService: UsersApiService, private readonly teamsRestService:TeamsRestService, readonly fob: UntypedFormBuilder) {
    this.fb = fob
   }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';

    this.userForm = this.fb.group<UserForm>({
      email: ['', []],
      companyId: [this.id, []],
      teamId: ['', []],
    });

    this.teamsRestService.getTeams({companyId: this.id}) 
    .pipe(
      tap((teams) => this.teams = teams)
    )
    .subscribe();
  }

  
  async submit() {
    
    console.log('new user to be created if service is created as well');
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const $this  = this;

    if (!this.userForm.value) return;

    const {
      email,
      companyId,
      teamId,
    } = this.userForm.value;

    let yourJWTToken = localStorage.getItem('@@auth0spajs@@::ThcIBQZrRso5QaZq67kCU5eFYTfZwTSK::https://api.usealto.com::openid profile email offline_access') || '';
    yourJWTToken = JSON.parse(yourJWTToken).body.access_token
    
   console.log(yourJWTToken);
   
  
    axios.post(environment.apiURL+'/v1/users',{
      email: email,
      company: companyId,
      team: teamId,
    },
    {
      headers: {
        Authorization: "Bearer " + yourJWTToken
      }
    })
    .then(function (response:any) {
      console.log(response);
      $this.router.navigate(['/admin/companies/', $this.id, 'users']);
    })
    .catch(function (error:any) {
      console.log(error);
    });


    
    
    
  }

}
