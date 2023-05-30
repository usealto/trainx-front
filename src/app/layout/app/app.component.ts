import { Component } from '@angular/core';

@Component({
  selector: 'alto-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor() {
    // Clean Up Bubble stuff
    const test = localStorage.getItem('_codeVersion');
    if (test) {
      localStorage.clear();
      window.location.reload();
    }
  }
}
