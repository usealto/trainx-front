import { Component } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';

@Component({
  selector: 'alto-continuing-training',
  templateUrl: './continuing-training.component.html',
  styleUrls: ['./continuing-training.component.scss'],
})
export class ContinuingTrainingComponent {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  guessesCount = 0;
}
