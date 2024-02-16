import { Component, Input } from '@angular/core';

export enum EPlaceholderStatus {
  GOOD = 'good',
  NO_RESULT = 'noResult',
  NO_DATA = 'noData',
  LOADING = 'loading',
}

@Component({
  selector: 'alto-placeholder-manager',
  templateUrl: './placeholder-manager.component.html',
  styleUrls: ['./placeholder-manager.component.scss'],
})
export class PlaceholderManagerComponent {
  EPlaceholderStatus = EPlaceholderStatus;

  @Input() status: EPlaceholderStatus = EPlaceholderStatus.GOOD;
}
