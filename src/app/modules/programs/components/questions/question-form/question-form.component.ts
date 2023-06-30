import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  AnswerFormatTypeEnumApi,
  CreateQuestionDtoApi,
  PatchQuestionRequestParams,
  PatchQuestionSubmittedDtoApiStatusEnumApi,
  ProgramDtoApi,
  QuestionDtoApi,
  QuestionTypeEnumApi,
  TagDtoApi,
} from '@usealto/sdk-ts-angular';
import { combineLatest, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { QuestionForm } from '../../../models/question.form';
import { ProgramsRestService } from '../../../services/programs-rest.service';
import { QuestionsRestService } from '../../../services/questions-rest.service';
import { QuestionsSubmittedRestService } from '../../../services/questions-submitted-rest.service';
import { TagsRestService } from '../../../services/tags-rest.service';

@UntilDestroy()
@Component({
  selector: 'alto-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss'],
})
export class QuestionFormComponent implements OnInit {
  I18ns = I18ns;
  QuestionSubmittedStatusEnum = PatchQuestionSubmittedDtoApiStatusEnumApi;
  @Input() program: ProgramDtoApi | undefined;
  @Input() question?: QuestionDtoApi;
  @Input() isSubmitted = false;
  @Output() createdQuestion = new EventEmitter<QuestionDtoApi>();
  @Output() dismissedQuestion = new EventEmitter<any>();
  private fb: IFormBuilder;
  questionForm!: IFormGroup<QuestionForm>;
  isEdit = false;

  programs: ProgramDtoApi[] = [];
  tags: TagDtoApi[] = [];

  questionHardLimit = 300;
  questionSoftLimit = 150;
  answerHardLimit = 200;
  answerSoftLimit = 75;

  public get answersAccepted(): FormArray<FormControl<string>> {
    return this.questionForm.controls.answersAccepted as FormArray<FormControl<string>>;
  }
  public get answersWrong(): FormArray<FormControl<string>> {
    return this.questionForm.controls.answersWrong as FormArray<FormControl<string>>;
  }

  constructor(
    private readonly programService: ProgramsRestService,
    private readonly tagService: TagsRestService,
    private readonly questionService: QuestionsRestService,
    private readonly questionSubmittedRestService: QuestionsSubmittedRestService,
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
          untilDestroyed(this),
        )
        .subscribe();

      this.questionForm = this.fb.group<QuestionForm>({
        title: ['', [Validators.required]],
        type: QuestionTypeEnumApi.MultipleChoice,
        tags: this.program ? [this.program.tags?.map((t) => t.id) as string[]] : [],
        programs: this.program ? [[this.program.id]] : [],
        answerType: AnswerFormatTypeEnumApi.Text,
        answersAccepted: this.fb.array([this.fb.control('')]),
        answersWrong: this.fb.array([this.fb.control(''), this.fb.control(''), this.fb.control('')]),
        explanation: '',
        link: '',
      });

      if (this.question) {
        this.isEdit = true;

        if (this.isSubmitted) {
          this.questionForm.patchValue({
            title: this.question.title,
          });
        } else {
          this.questionForm.patchValue({
            title: this.question.title,
            tags: this.question.tags?.map((t) => t.id),
            programs: this.question.programs?.map((p) => p.id),
            explanation: this.question.explanation,
            link: this.question.link,
          });
          this.questionForm.controls.answersAccepted = this.fb.array(
            this.question.answersAccepted.map((a) => this.fb.control(a)),
          );
          this.questionForm.controls.answersWrong = this.fb.array(
            this.question.answersWrong.map((a) => this.fb.control(a)),
          );
        }
      }
    }, 0);
  }

  createQuestion() {
    if (!this.questionForm.value) return;

    const { title, type, tags, programs, answerType, answersAccepted, answersWrong, explanation, link } =
      this.questionForm.value;

    const params: CreateQuestionDtoApi = {
      title,
      type,
      tagIds: tags.map((id) => ({ id })),
      programIds: programs ? programs.map((id) => ({ id })) : [],
      answerType,
      answersAccepted: answersAccepted.filter((a) => !!a),
      answersWrong: answersWrong.filter((a) => !!a),
      explanation,
      link,
    };
    if ((!this.isEdit && !this.question) || this.isSubmitted) {
      this.questionService
        .createQuestion(params)
        .pipe(
          tap((question) => this.createdQuestion.emit(question)),
          tap(() => {
            if (this.isSubmitted) {
              this.changeStatus(PatchQuestionSubmittedDtoApiStatusEnumApi.Accepted);
            }
          }),
          tap(() => this.activeOffcanvas.dismiss()),
          untilDestroyed(this),
        )
        .subscribe();
    } else {
      this.questionService
        .updateQuestion({ id: this.question?.id, patchQuestionDtoApi: params } as PatchQuestionRequestParams)
        .pipe(
          tap((question) => this.createdQuestion.emit(question)),
          tap(() => this.activeOffcanvas.dismiss()),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  changeStatus(status: PatchQuestionSubmittedDtoApiStatusEnumApi) {
    if (this.question) {
      this.questionSubmittedRestService
        .update({
          id: this.question.id,
          patchQuestionSubmittedDtoApi: { status },
        })
        .pipe(
          tap(() => this.dismissedQuestion.emit()),
          tap(() => this.activeOffcanvas.dismiss()),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  addGoodAnwswer() {
    this.answersAccepted.push(this.fob.control(''));
  }
  addBadAnwswer() {
    this.answersWrong.push(this.fob.control(''));
  }

  // @memoize()
  // getLength(data: string | undefined | null): number {
  //   if (!data) {
  //     return 0;
  //   } else {
  //     return data.length;
  //   }
  // }
}
