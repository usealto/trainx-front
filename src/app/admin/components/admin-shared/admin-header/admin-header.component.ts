import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, distinctUntilChanged } from 'rxjs';
import { coerceBooleanProperty } from 'src/app/modules/shared/helpers/coerce-property';

export interface IBreadCrumb {
  label: string;
  url: string | any[];
}
@Component({
  selector: 'alto-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
})
export class AdminHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input()
  get divider(): boolean {
    return this._divider;
  }
  set divider(value: boolean) {
    this._divider = coerceBooleanProperty(value);
  }
  private _divider = false;
  @Input() public breadcrumbs: IBreadCrumb[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {}
}
