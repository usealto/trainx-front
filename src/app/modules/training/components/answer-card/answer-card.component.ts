import { Component, Input } from '@angular/core';

@Component({
  selector: 'alto-answer-card',
  templateUrl: './answer-card.component.html',
  styleUrls: ['./answer-card.component.scss'],
})
export class AnswerCardComponent {
  @Input() answer!: string;
  @Input() type = 'empty';
  @Input() goodAnswers!: Array<any>;

  countCorrectAnswers() {
    const test = this.goodAnswers;
    console.log('test   ', test);
    return this.goodAnswers.length;
  }
}
