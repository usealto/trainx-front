import { Component } from '@angular/core';
import { LoadingStore } from './loading.store';

@Component({
  selector: 'alto-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent {
  constructor(public readonly laodingStore: LoadingStore) {}
}
