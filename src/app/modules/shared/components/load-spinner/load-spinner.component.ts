import { Component, Input } from '@angular/core';

export enum ELoadingStatus {
  LOADING = 'loading',
  ERROR = 'error',
  SUCCESS = 'success',
  DEFAULT = 'default',
}

@Component({
  selector: 'alto-load-spinner',
  templateUrl: './load-spinner.component.html',
  styleUrls: ['./load-spinner.component.scss'],
})
export class LoadSpinnerComponent {
  @Input() status: ELoadingStatus = ELoadingStatus.DEFAULT;
  @Input() size = 24;

  ELoadingStatus = ELoadingStatus;
}
