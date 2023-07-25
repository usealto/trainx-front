import { ViewportScroller } from '@angular/common';
import { AfterViewInit, Component, HostListener, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';

/**
 * !DEPRECATED To delete
 */
@UntilDestroy()
@Component({
  selector: 'alto-anchor-navigator',
  templateUrl: './anchor-navigator.component.html',
  styleUrls: ['./anchor-navigator.component.scss'],
})
export class AnchorNavigatorComponent implements AfterViewInit {
  @HostListener('click', ['$event.target'])
  onClick() {
    this.scrollToAnchor();
  }

  @Input() fragment = '';

  constructor(private route: ActivatedRoute, private viewportScroller: ViewportScroller) {}

  ngAfterViewInit(): void {
    if (this.route.snapshot.fragment && this.fragment === this.route.snapshot.fragment) {
      setTimeout(() => {
        this.scrollToAnchor();
      }, 500);
    }
  }

  scrollToAnchor() {
    if (this.fragment) {
      this.viewportScroller.scrollToAnchor(this.fragment);
    }
  }
}
