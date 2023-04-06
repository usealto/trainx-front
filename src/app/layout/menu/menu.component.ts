import { Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { buildTime } from 'src/build-time';

@UntilDestroy()
@Component({
  selector: 'alto-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  AltoRoutes = AltoRoutes;
  I18ns = I18ns;
  buildTime = buildTime;
}
