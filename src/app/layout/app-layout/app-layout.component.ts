import { Component } from '@angular/core';

@Component({
  selector: 'alto-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
})
export class AppLayoutComponent {
  i = true;
  darkMode() {
    if (this.i) {
      document.getElementsByTagName('body')[0].classList.add('dark-theme');
    } else {
      document.getElementsByTagName('body')[0].classList.remove('dark-theme');
    }
    this.i = !this.i;
  }
}
