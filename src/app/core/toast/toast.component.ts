import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { Component, HostBinding } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from './toast.service';

@Component({
  selector: 'alto-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  imports: [NgbToastModule, NgIf, NgTemplateOutlet, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault],
  standalone: true,
})
export class ToastComponent {
  @HostBinding('class') classes = ['toast-container', 'position-fixed', 'top-0', 'end-0', 'm-4', 'fw-medium'];

  constructor(public toastService: ToastService) {}
}
