import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { QuestionDtoApi, QuestionDtoPaginatedResponseApi } from '@usealto/sdk-ts-angular';
import { QuestionDisplayLight } from '../../../models/question.model';

@Component({
  selector: 'alto-questions-table',
  templateUrl: './questions-table.component.html',
  styleUrls: ['./questions-table.component.scss'],
})
export class QuestionsTableComponent implements OnChanges {
  @Input() data?: QuestionDtoPaginatedResponseApi;
  @Input() isChecked = false;

  @Output() changeQuestionAssociation = new EventEmitter<{ questionId: string; toDelete: boolean }>();
  @Output() openQuestionForm = new EventEmitter<QuestionDisplayLight>();
  @Output() pageChange = new EventEmitter<any>();

  questionsCount = 0;
  questionPage = 1;
  questionPageSize = 10;

  questionsDisplay: QuestionDisplayLight[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']?.currentValue) {
      this.questionsDisplay = this.mapQuestionsToDisplay(changes['data'].currentValue.data);
      this.questionsCount = changes['data'].currentValue.meta.totalItems;
    }
  }

  mapQuestionsToDisplay(questions: QuestionDtoApi[] | undefined): QuestionDisplayLight[] {
    if (!questions) {
      return [];
    }
    return questions.map((q) => ({
      id: q.id,
      title: q.title,
      isChecked: this.isChecked,
    }));
  }

  addOrRemoveQuestion(questionId: string, toDelete: boolean) {
    this.changeQuestionAssociation.emit({ questionId, toDelete });
  }

  openForm(question?: QuestionDisplayLight) {
    this.openQuestionForm.emit(question);
  }
  questionPageChange(e: number) {
    this.pageChange.emit(e);
  }
}
