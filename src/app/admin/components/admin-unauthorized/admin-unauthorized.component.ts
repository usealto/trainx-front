import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UserDtoApi } from '@usealto/sdk-ts-angular';

@Component({
  selector: 'alto-admin-unauthorized',
  templateUrl: './admin-unauthorized.component.html',
  styleUrls: ['./admin-unauthorized.component.scss']
})
export class AdminUnauthorizedComponent implements OnInit {

  constructor(private readonly usersRestService:UsersRestService, private readonly router:Router) { }
  user!: UserDtoApi

  ngOnInit() { 
    this.usersRestService.getMe().subscribe((user)=> {
      this.user = user
      // redirect to the hoe admin page if the user is an admin
      // or if the user is impersonnated
      if (/alto-admin/.test(this.user.roles.toString())
        || (localStorage.getItem('impersonatedUser') !== '' && localStorage.getItem('impersonatedUser'))) {
        this.router.navigate(['admin', 'home']);
      }
    })
  }

  disconnect() {
    localStorage.setItem('impersonatedUser', '')
    window.location.reload()
  }

  goHome() {
    this.router.navigate(['/admin', 'home'])
  }
}
