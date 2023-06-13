import { Component, EventEmitter, Input, Output } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-explanation',
  templateUrl: './explanation.component.html',
  styleUrls: ['./explanation.component.scss'],
})
export class ExplanationComponent {
  @Input() explanation!: string;
  @Input() result!: string;
  @Input() link!: string;
  @Input() correctAnswers!: string[];
  @Output() nextQuestion = new EventEmitter<any>();

  I18ns = I18ns;

  public get answers(): string {
    return this.correctAnswers.map((a) => '"' + a + '"').join(', ');
  }

  next() {
    this.nextQuestion.emit();
  }
}
