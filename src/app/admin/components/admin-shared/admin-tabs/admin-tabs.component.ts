import { Component, ContentChildren, Input, QueryList } from '@angular/core';
import { AdminTabComponent } from './admin-tab.component';

@Component({
  selector: 'alto-admin-tabs',
  template: `
    <div class="nav nav-tabs">
      <div
        *ngFor="let tab of tabs"
        (click)="selectTab(tab)"
        class="admin-tab flex-grow-1"
        [class.active]="tab.active"
      >
        <div class="indicator"></div>
        <div class="pb-3 d-flex align-items-center">
          <div *ngIf="tab.icon" class="float-start mx-3 alto-badge-big">
            <i [class]="tab.icon" class="fs-4 bi"></i>
          </div>
          <span>{{ tab.tabTitle }}</span>
          <i class="ms-2 fs-5 bi float-end bi-question-circle" placement="top" ngbTooltip="test"></i>
        </div>
      </div>
    </div>
    <ng-content></ng-content>
  `,
  styleUrls: ['./admin-tabs.component.scss'],
})
export class AdminTabsComponent {
  @ContentChildren(AdminTabComponent) tabs: QueryList<AdminTabComponent> | undefined;
  // contentChildren are set
  ngAfterContentInit() {
    // get all active tabs
    if (this.tabs) {
      const activeTabs = this.tabs.filter((tab) => tab.active);

      // if there is no active tab set, activate the first
      if (activeTabs.length === 0) {
        this.selectTab(this.tabs.first);
      }
    }
  }

  selectTab(tab: AdminTabComponent) {
    // deactivate all tabs
    this.tabs?.toArray().forEach((tab) => (tab.active = false));

    // activate the tab the user has clicked on.
    tab.active = true;
  }
}
