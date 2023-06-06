import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'alto-answer-card',
  templateUrl: './answer-card.component.html',
  styleUrls: ['./answer-card.component.scss'],
})
export class AnswerCardComponent implements OnInit {
  @Input() answer!: string;
  @Input() type = 'empty';
  @Input() goodAnswers!: Array<any>;

  ngOnInit(): void {
    this.countCorrectAnswers();
  }
  countCorrectAnswers() {
    const correctAnswers = [];
    correctAnswers.push(this.goodAnswers);
    return correctAnswers[0].length;
  }
}
