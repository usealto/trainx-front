import { Component } from '@angular/core';
import { AltoRoutes } from '../../../shared/constants/routes';
import { I18ns } from '../../../../core/utils/i18n/I18n';

@Component({
  selector: 'alto-create-program-btn',
  templateUrl: './create-program-btn.component.html',
  styleUrls: ['./create-program-btn.component.scss'],
})
export class CreateProgramBtnComponent {
  AltoRoutes = AltoRoutes;
  I18ns = I18ns;

  isDropdownOpen = false;

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
}
