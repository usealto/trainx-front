import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProgramsRestService } from '../../../services/programs-rest.service';
import { ProgramApi, QuestionApi, TagApi } from 'src/app/sdk';
import { combineLatest, tap } from 'rxjs';
import { QuestionsRestService } from '../../../services/questions-rest.service';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { TagForm } from '../../../models/tag.form';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { TagsRestService } from '../../../services/tags-rest.service';

@Component({
  selector: 'alto-tags-form',
  templateUrl: './tag-form.component.html',
  styleUrls: ['./tag-form.component.scss'],
})
export class TagsFormComponent implements OnInit {
  I18ns = I18ns;
  @Output() createdTag = new EventEmitter<TagApi>();
  private fb: IFormBuilder;
  tagForm!: IFormGroup<TagForm>;

  programs: ProgramApi[] = [];
  questions: QuestionApi[] = [];

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    private readonly programService: ProgramsRestService,
    private readonly questionService: QuestionsRestService,
    private readonly tagService: TagsRestService,
    readonly fob: UntypedFormBuilder,
  ) {
    this.fb = fob;
  }

  ngOnInit(): void {
    setTimeout(() => {
      combineLatest([this.programService.getPrograms(), this.questionService.getQuestions()])
        .pipe(
          tap(([programs, questions]) => {
            this.programs = programs ?? [];
            this.questions = questions ?? [];
          }),
        )
        .subscribe();

      this.tagForm = this.fb.group<TagForm>({
        name: ['', [Validators.required]],
        programs: [],
        questions: [],
        description: '',
      });
    }, 0);
  }

  createTag() {
    if (!this.tagForm.value) return;
    const { name, programs, questions, description } = this.tagForm.value;

    this.tagService
      .createTag({
        name,
        description,
      })
      .pipe(
        tap((tag) => this.createdTag.emit(tag)),
        tap(() => this.activeOffcanvas.dismiss()),
      )
      .subscribe();
  }
}
