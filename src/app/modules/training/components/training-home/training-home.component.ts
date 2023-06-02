import { Component } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-training-home',
  templateUrl: './training-home.component.html',
  styleUrls: ['./training-home.component.scss'],
})
export class TrainingHomeComponent {
  I18ns = I18ns;
  activeTab = 1;

  switchTab(index: number) {
    this.activeTab = index;
  }
}
