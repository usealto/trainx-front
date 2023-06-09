import { Component, EventEmitter, Input, Output } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-button-group',
  templateUrl: './button-group.component.html',
  styleUrls: ['./button-group.component.scss'],
})
export class ButtonGroupComponent {
  I18ns = I18ns;
  @Input() value = '';
  @Input() items: { label: string; value: any }[] = [];
  @Output() valueSelected = new EventEmitter<string>();
  ID = '';

  ngOnInit(): void {
    this.ID = 'btnGrp' + Math.round(Math.random() * 1000);
  }

  update(event: any) {
    this.value = event.target.value;
    this.valueSelected.emit(this.value);
  }
}
