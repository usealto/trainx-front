import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { Component, OnInit } from '@angular/core';
import { UserDtoApi } from 'src/app/sdk';

@Component({
  selector: 'alto-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss','../../../../layout/menu/menu.component.scss'],
})
export class AdminMenuComponent implements OnInit {
  constructor(private readonly usersRestService:UsersRestService) { }
  user!: UserDtoApi
  impersonatedUser = localStorage.getItem('impersonatedUser') !== '' 
  && localStorage.getItem('impersonatedUser')

  ngOnInit() { 
    this.usersRestService.getMe().subscribe((user)=> {
      this.user = user
    })
    
  }

  removeImpersonation() {
    localStorage.setItem('impersonatedUser','')
    this.impersonatedUser = false
  }

  removeImpersonationAndreload() {
    this.removeImpersonation()
    window.location.reload()
  }


}
