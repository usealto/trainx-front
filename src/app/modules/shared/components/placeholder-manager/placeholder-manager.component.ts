import { Component, Input } from '@angular/core';
import { PlaceholderDataStatus } from '../../models/placeholder.model';

@Component({
  selector: 'alto-placeholder-manager',
  templateUrl: './placeholder-manager.component.html',
  styleUrls: ['./placeholder-manager.component.scss'],
})
export class PlaceholderManagerComponent {
  @Input() status: PlaceholderDataStatus = 'good';
}
