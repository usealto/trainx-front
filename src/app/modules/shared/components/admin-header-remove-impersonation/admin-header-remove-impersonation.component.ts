import { Component } from '@angular/core';
import { DataService } from 'src/app/admin/admin-data.service';

@Component({
  selector: 'alto-admin-header-remove-impersonation',
  templateUrl: './admin-header-remove-impersonation.component.html',
  styleUrls: ['./admin-header-remove-impersonation.component.scss']
})
export class AdminHeaderRemoveImpersonationComponent {

  constructor(
    private readonly dataService: DataService) {}

  impersonatedUser =
    localStorage.getItem('impersonatedUser') !== '' && localStorage.getItem('impersonatedUser');
  impersonatedUserEmail = localStorage.getItem('impersonatedUser');

  removeImpersonation() {
    localStorage.setItem('impersonatedUser', '');
    this.impersonatedUser = false;
    this.dataService.sendData('impersonatedUserUpdated');
  }

}
