import { Component, OnInit } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { UserDtoApi } from 'src/app/sdk';
import { buildTime } from 'src/build-time';

@UntilDestroy()
@Component({
  selector: 'alto-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  AltoRoutes = AltoRoutes;
  I18ns = I18ns;
  buildTime = buildTime;

  url = '';
  name = '';
  email = '';

  constructor(public readonly userStore: ProfileStore) {}

  ngOnInit(): void {
    const { pictureUrl, firstname, lastname, username, email } = this.userStore.user.value;
    this.url = pictureUrl || '';
    this.name = (!firstname || !lastname ? username : firstname + ' ' + lastname) ?? '';
    this.email = email;
  }
}
