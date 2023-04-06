import { Component, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'alto-anchor-navigator',
  templateUrl: './anchor-navigator.component.html',
  styleUrls: ['./anchor-navigator.component.scss'],
})
export class AnchorNavigatorComponent {
  @HostListener('click', ['$event.target'])
  onClick(btn: any) {
    // console.log('button', btn, 'number of clicks:', this.numberOfClicks++);
    console.log(btn);
  }

  constructor(private route: ActivatedRoute) {
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        console.log(fragment);
        document.querySelector('#' + fragment)?.scrollIntoView();
      }
    });
  }
}
