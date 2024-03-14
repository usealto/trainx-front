import { Component, ElementRef, HostListener } from '@angular/core';
import { I18ns } from '../../../../../../core/utils/i18n/I18n';
import { AltoRoutes } from '../../../../../shared/constants/routes';

@Component({
  selector: 'alto-create-programs-button',
  templateUrl: './create-programs-button.component.html',
  styleUrls: ['./create-programs-button.component.scss'],
})
export class CreateProgramsButtonComponent {
  isDropdownOpen = false;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  constructor(private el: ElementRef) {}

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
}
