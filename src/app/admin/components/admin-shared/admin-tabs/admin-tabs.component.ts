import { Component, ContentChildren, Input, QueryList } from '@angular/core';
import { AdminTabComponent } from './admin-tab.component';

@Component({
  selector: 'alto-admin-tabs',
  template: `
    <div class="nav nav-tabs">
      <div
        class="flex-grow-1 admin-tab"
        *ngFor="let tab of tabs"
        (click)="selectTab(tab)"
        [class.active]="tab.active"
      >
        {{ tab.tabTitle }}
      </div>
    </div>
    <ng-content></ng-content>
  `,
  styles: [
    `
      .tab-close {
        color: gray;
        text-align: right;
        cursor: pointer;
      }
      .admin-tab.active {
        border-bottom: 2px #175cd3 solid;
        color: #175cd3;
      }
    `,
  ],
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
