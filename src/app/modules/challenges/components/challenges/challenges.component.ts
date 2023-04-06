import { Component } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-challenges',
  templateUrl: './challenges.component.html',
  styleUrls: ['./challenges.component.scss'],
})
export class ChallengesComponent {
  I18ns = I18ns;
}
