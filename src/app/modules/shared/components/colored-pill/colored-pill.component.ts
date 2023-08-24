import { Component, Input } from '@angular/core';
import { memoize } from 'src/app/core/utils/memoize/memoize';

@Component({
  selector: 'alto-colored-pill-list',
  templateUrl: './colored-pill.component.html',
  styleUrls: ['./colored-pill.component.scss'],
})

/**
 * @description List of Colored Pills
 *
 */
export class ColoredPillListComponent {
  /**  The data to be displayed in the list. Must be an object with at least a "name" property */
  @Input() data: any[] = [];
  /**  Choose if you want colors. Will be automatically assigned based on the "id" property from "data" using a pipe helper */
  @Input() hasDynamicColor = false;
  /**  Number maximum of data to diplay, then a `+X` will be shown */
  @Input() limit = 0;
  /**  Number of maximum characters to be shown */
  @Input() textLimit = 100;
  /**  If the limit is reached, and the user hovers above the `+X` then this text will be shown in a tooltip */
  @Input() tooltip: any;

  @memoize()
  getText(d: any): string {
    return d.shortName || d.name || d.title || d.label || d;
  }
}
