import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-question-submitted-form',
  templateUrl: './question-submitted-form.component.html',
  styleUrls: ['./question-submitted-form.component.scss'],
})
export class QuestionSubmittedFormComponent {
  I18ns = I18ns;
  @Input() programName = '';
  @Output() createdQuestion = new EventEmitter<string>();

  name = new FormControl('');

  constructor(public activeOffcanvas: NgbActiveOffcanvas) {}

  createQuestion() {
    this.createdQuestion.emit(this.name.value ?? '');
    this.activeOffcanvas.close();
  }
}
