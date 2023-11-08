import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDtoApi, UsersApiService } from '@usealto/sdk-ts-angular';
import { map } from 'rxjs';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';

@Component({
  selector: 'alto-impersonate',
  templateUrl: './impersonate.component.html',
  styleUrls: ['./impersonate.component.scss']
})
export class ImpersonateComponent implements OnInit{
    userToImpersonate?: string;
    userObj?: UserDtoApi;
    // to show explanation if we encouter some issue
    notFound = false; 
    redirectAuto = false;
  
    constructor(
      private route : ActivatedRoute, 
      private router : Router,
      private readonly usersRestService: UsersRestService,
      private readonly userApi: UsersApiService,
      ){}
  
    ngOnInit(): void {
      this.route.params.subscribe(params => {
        this.userToImpersonate = params['id'];
      });
      // here we check if we should redirect automatically to avoid timeloss
      this.redirectAuto = this.route.snapshot.queryParams['auto'];

      if(this.userToImpersonate && this.redirectAuto){
        this.impersonate();
      } 

    }

    impersonate(){
      localStorage.setItem('impersonatedUser', this.userToImpersonate || '');
      
      // here we try to fetch the user, and if cannot be found we cancel the impersonation
      // we must skip the store here
      try {
        this.userApi.getMe().pipe(
          map((u) => u.data || ({} as UserDtoApi)),
        ).subscribe((res) => {
          this.userObj = res
          if(!res){
            this.notFound = true;
            localStorage.setItem('impersonatedUser', '');
          }else if(this.redirectAuto){
            window.location.href = '/'; // this is the only way to refresh the page
          }
        }) 
      } catch (e) {
        this.notFound = true;
        localStorage.setItem('impersonatedUser', '');
      }
    }

}
