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
  userImpersonated = localStorage.getItem('userImpersonated') === ''

  ngOnInit() { 
    this.usersRestService.getMe().subscribe((user)=> {
      this.user = user
    })
    
  }

  removeImpersonation() {
    localStorage.setItem('userImpersonated','')
    this.userImpersonated = false
    window.location.reload()
  }


}
