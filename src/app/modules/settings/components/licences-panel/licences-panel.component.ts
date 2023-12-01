import { Component, Input } from '@angular/core';
import { I18ns } from '../../../../core/utils/i18n/I18n';

@Component({
  selector: 'alto-licences-panel',
  templateUrl: './licences-panel.component.html',
  styleUrls: ['./licences-panel.component.scss'],
})
export class LicencesPanelComponent {
  I18ns = I18ns;

  @Input() licencesCount!: number;
  @Input() assignedLicencesCount!: number;

  getProgressbarWidth(): string {
    return `${(this.assignedLicencesCount / this.licencesCount) * 100}%`;
  }
}
