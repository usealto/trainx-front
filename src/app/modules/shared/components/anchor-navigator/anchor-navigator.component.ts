import { Component, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'alto-anchor-navigator',
  templateUrl: './anchor-navigator.component.html',
  styleUrls: ['./anchor-navigator.component.scss'],
})
export class AnchorNavigatorComponent implements OnChanges {
  @HostListener('click', ['$event.target'])
  onClick() {
    this.scrollToAnchor();
  }

  @Input() fragment = '';

  constructor(private route: ActivatedRoute) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.['fragment'].firstChange) {
      if (this.route.snapshot.fragment && this.fragment === this.route.snapshot.fragment) {
        setTimeout(() => {
          this.scrollToAnchor();
        }, 500);
      }
    }
  }

  scrollToAnchor() {
    if (this.fragment) {
      document.querySelector('#' + this.fragment)?.scrollIntoView();
    }
  }
}
