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
    return this.goodAnswers.length;
  }
}
