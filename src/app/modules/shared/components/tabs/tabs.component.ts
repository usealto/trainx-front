import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

export interface ITabOption {
  label: string;
  value: any;
}

@Component({
  selector: 'alto-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent {
  I18ns = I18ns;

  // @Input() labels: string[] = [];
  // @Input() selectedValue: any;
  // @Input() data: { label: string; value: any }[] = [];
  // @Output() tabChanged = new EventEmitter<any>();

  @Input() options: ITabOption[] = [];
  @Input() selectedControl: FormControl<ITabOption | null> = new FormControl(this.options[0] ?? null);

  switchTab(option: ITabOption): void {
    this.selectedControl.patchValue(option);
  }
}
