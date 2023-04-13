import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UserApi } from 'src/app/sdk';
@Component({
  selector: 'alto-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss','../../../layout/app-layout/app-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit {
  constructor(private readonly usersRestService:UsersRestService, private readonly router:Router) { }
  user!: UserApi
  authorized!: boolean

  ngOnInit() { 
    this.usersRestService.getMe().subscribe((user)=> {
      this.user = user

      console.log(/alto-admin/.test(this.user.roles.toString()));
    
      if ( !/alto-admin/.test(this.user.roles.toString()) ) {
        this.authorized = false
        this.router.navigate(['admin','unauthorized'])
      }
    })
    
  }
}
