import { Component, Input, OnInit } from '@angular/core';
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
export class TabsComponent implements OnInit {
  I18ns = I18ns;

  @Input() options: ITabOption[] = [];
  @Input() selectedControl: FormControl<ITabOption | null> = new FormControl(this.options[0] ?? null);

  ngOnInit(): void {
    if (!this.selectedControl.value && this.options.length > 0) {
      this.selectedControl.patchValue(this.options[0]);
    }
  }

  switchTab(option: ITabOption): void {
    this.selectedControl.patchValue(option);
  }
}
