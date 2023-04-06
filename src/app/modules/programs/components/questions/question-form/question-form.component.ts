import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, forkJoin, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AnswerFormatTypeEnumApi, ProgramApi, QuestionApi, QuestionTypeEnumApi, TagApi } from 'src/app/sdk';
import { QuestionForm } from '../../../models/question.form';
import { ProgramsRestService } from '../../../services/programs-rest.service';
import { QuestionsRestService } from '../../../services/questions-rest.service';
import { TagsRestService } from '../../../services/tags-rest.service';

@Component({
  selector: 'alto-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss'],
})
export class QuestionFormComponent implements OnInit {
  I18ns = I18ns;
  @Input() program: ProgramApi | undefined;
  @Output() createdQuestion = new EventEmitter<QuestionApi>();
  private fb: IFormBuilder;
  questionForm!: IFormGroup<QuestionForm>;

  programs: ProgramApi[] = [];
  tags: TagApi[] = [];

  constructor(
    private readonly programService: ProgramsRestService,
    private readonly tagService: TagsRestService,
    private readonly questionService: QuestionsRestService,
    readonly fob: UntypedFormBuilder,
    public activeOffcanvas: NgbActiveOffcanvas,
  ) {
    this.fb = fob;
  }

  ngOnInit(): void {
    setTimeout(() => {
      combineLatest([this.tagService.getTags(), this.programService.getPrograms()])
        .pipe(
          tap(([tags, programs]) => {
            this.tags = tags ?? [];
            this.programs = programs ?? [];
          }),
        )
        .subscribe();

      this.questionForm = this.fb.group<QuestionForm>({
        title: ['', [Validators.required]],
        type: QuestionTypeEnumApi.MultipleChoice,
        tags: this.program ? [this.program.tags?.map((t) => t.id) as string[]] : [],
        programs: this.program ? [[this.program.id]] : [],
        answerType: AnswerFormatTypeEnumApi.Text,
        answersAccepted: ['', [Validators.required]],
        answersWrong1: ['', [Validators.required]],
        answersWrong2: [''],
        answersWrong3: [''],
        explanation: '',
        link: '',
      });
    }, 0);
  }

  createQuestion() {
    if (!this.questionForm.value) return;
    const {
      title,
      type,
      tags,
      programs,
      answerType,
      answersAccepted,
      answersWrong1,
      answersWrong2,
      answersWrong3,
      explanation,
      link,
    } = this.questionForm.value;

    this.questionService
      .createQuestion({
        title,
        type,
        tags: tags.map((id) => ({ id } as TagApi)),
        programs: programs.map((id) => ({ id } as ProgramApi)),
        answerType,
        answersAccepted: [answersAccepted],
        answersWrong: [answersWrong1, answersWrong2, answersWrong3].filter((a) => !!a),
        explanation,
        link,
      })
      .pipe(
        tap((question) => this.createdQuestion.emit(question)),
        tap(() => this.activeOffcanvas.dismiss()),
      )
      .subscribe();
  }
}
