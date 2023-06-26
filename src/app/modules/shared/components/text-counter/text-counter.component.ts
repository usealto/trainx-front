import { Component, Input, OnInit } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-text-counter',
  templateUrl: './text-counter.component.html',
  styleUrls: ['./text-counter.component.scss'],
})
export class TextCounterComponent implements OnInit {
  I18ns = I18ns;
  @Input() control?: any;
  @Input() placeholder?: string;
  @Input() limit = 100;
  @Input() softLimit = 100;

  wordCount = 0;
  isFocused = false;

  wordChange(num: string) {
    this.wordCount = num.length;
  }

  focusText(isFocus: boolean) {
    this.isFocused = isFocus;
  }

  ngOnInit(): void {
    this.wordChange(this.control.value);
  }
}
