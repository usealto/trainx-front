import { Component } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-no-small-screen',
  templateUrl: './no-small-screen.component.html',
  styleUrls: ['./no-small-screen.component.scss'],
})
export class NoSmallScreenComponent {
  I18ns = I18ns;
}
