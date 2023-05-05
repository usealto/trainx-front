import { Component, Input, OnInit } from '@angular/core';
import { AltoRoutes } from '../../constants/routes';

@Component({
  selector: 'alto-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss'],
})
export class ProfileCardComponent implements OnInit {
  AltoRoutes = AltoRoutes;

  @Input() user: any = null;
  @Input() isWhite = false;

  url = '';
  name = '';
  email = '';

  ngOnInit(): void {
    if (this.user) {
      const { pictureUrl, username, firstname, lastname, email } = this.user;

      this.url = pictureUrl || '';
      this.name = (!firstname || !lastname ? username : firstname + ' ' + lastname) ?? '';
      this.email = email;
    }
  }
}
