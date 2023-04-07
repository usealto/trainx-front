import { Component, HostListener, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'alto-anchor-navigator',
  templateUrl: './anchor-navigator.component.html',
  styleUrls: ['./anchor-navigator.component.scss'],
})
export class AnchorNavigatorComponent {
  @HostListener('click', ['$event.target'])
  onClick() {
    this.scrollToAnchor();
  }

  @Input() fragment = '';
  // @Input() routerLink: string[] = [];

  constructor(private route: ActivatedRoute) {
    this.route.fragment
      .pipe(
        tap((fragment) => {
          if (fragment && this.fragment === fragment) {
            console.log(fragment);
            this.scrollToAnchor();
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  scrollToAnchor() {
    if (this.fragment) {
      document.querySelector('#' + this.fragment)?.scrollIntoView();
    }
  }
}
