import { Component, Input } from '@angular/core';
import { I18ns } from '../../../../core/utils/i18n/I18n';

@Component({
  selector: 'alto-licenses-panel',
  templateUrl: './licenses-panel.component.html',
  styleUrls: ['./licenses-panel.component.scss'],
})
export class LicensesPanelComponent {
  I18ns = I18ns;

  @Input() licensesCount!: number;
  @Input() assignedLicensesCount!: number;

  getProgressbarWidth(): string {
    return `${(this.assignedLicensesCount / this.licensesCount) * 100}%`;
  }
}
