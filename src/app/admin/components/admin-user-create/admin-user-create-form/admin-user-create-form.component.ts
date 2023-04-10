import { UsersApiService } from 'src/app/sdk';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'alto-admin-user-create-form',
  templateUrl: './admin-user-create-form.component.html',
  styleUrls: ['./admin-user-create-form.component.scss']
})
export class AdminUserCreateFormComponent {
  constructor(private router: Router, private route: ActivatedRoute, private usersApiService: UsersApiService) { }
  async submit() {
    
    console.log('new user to be created if service is created as well');
    
    
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.router.navigate(['/admin/companies/', id, 'users']);
  }

}
