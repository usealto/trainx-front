import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, filter, map, of, switchMap, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { PriorityEnumApi, ProgramDtoApi, QuestionDtoApi, TagApi, TeamApi } from '@usealto/sdk-ts-angular';
import { ProgramForm } from '../../models/programs.form';
import { QuestionDisplay } from '../../models/question.model';
import { ProgramsStore } from '../../programs.store';
import { ProgramsRestService } from '../../services/programs-rest.service';
import { QuestionsRestService } from '../../services/questions-rest.service';
import { QuestionFormComponent } from '../questions/question-form/question-form.component';

@UntilDestroy()
@Component({
  selector: 'alto-create-programs',
  templateUrl: './create-programs.component.html',
  styleUrls: ['./create-programs.component.scss'],
})
export class CreateProgramsComponent implements OnInit {
  I18ns = I18ns;
  private fb: IFormBuilder;

  programForm!: IFormGroup<ProgramForm>;
  currentStep = 1;
  createdProgram: ProgramDtoApi | undefined;
  editedProgram!: ProgramDtoApi;
  isEdit = false;

  questions!: QuestionDtoApi[];
  questionsDisplay: QuestionDisplay[] = [];
  questionList: { id: string; delete: boolean }[] = [];
  questionPage = 1;
  questionPageSize = 10;
  associatedQuestionsCount = 0;

  selectedTags: string[] = [];

  constructor(
    readonly fob: UntypedFormBuilder,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly programRestService: ProgramsRestService,
    private readonly questionRestService: QuestionsRestService,
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    public programStore: ProgramsStore,
    public teamStore: TeamStore,
  ) {
    this.fb = fob;
  }

  ngOnInit(): void {
    this.route.params
      .pipe(
        map((p) => {
          if (p['id'] === 'new') {
            this.initForm();
            return null;
          } else {
            this.isEdit = true;
            return p['id'];
          }
        }),
        filter((x) => !!x),
        switchMap((id) => this.programRestService.getProgram(id)),
        tap((p) => (this.editedProgram = p)),
        tap((p) => this.initForm(p)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  initForm(program?: ProgramDtoApi) {
    this.programForm = this.fb.group<ProgramForm>({
      name: [program?.name ?? '', [Validators.required]],
      priority: [program?.priority ?? null, [Validators.required]],
      description: program?.description ?? '',
      expectation: [program?.expectation ?? 60, [Validators.required]],
      tags: [program?.tags?.map((t) => t.id) ?? [], [Validators.required]],
      teams: [program?.teams?.map((t) => t.id) ?? []],
    });
  }

  saveProgram() {
    if (this.programForm.value) {
      const { tags, teams, priority, ...rest } = this.programForm.value;

      const progValues = {
        ...rest,
        priority: priority as string as PriorityEnumApi,
        tags: tags.map((id) => ({ id } as TagApi)),
        teams: teams.map((id) => ({ id } as TeamApi)),
      };

      let obs$: Observable<any>;

      if (this.isEdit) {
        obs$ = !this.programForm.touched
          ? of(null)
          : this.programRestService.updateProgram(this.editedProgram.id, progValues);
      } else {
        obs$ = this.programRestService.createProgram(progValues);
      }

      obs$
        .pipe(
          filter((x) => !!x),
          map((d) => d.data),
          map((prog: ProgramDtoApi) => {
            this.isEdit ? (this.editedProgram = prog) : (this.createdProgram = prog);
            return prog.tags ?? [];
          }),
          tap((tags) => (this.selectedTags = tags?.map((t) => t.id))),
          tap(() => (this.programStore.programs.value = [])),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  openQuestionForm() {
    const canvasRef = this.offcanvasService.open(QuestionFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });
    canvasRef.componentInstance.program = this.isEdit ? this.editedProgram : this.createdProgram;
    canvasRef.componentInstance.createdQuestion.pipe(tap(() => this.getQuestions())).subscribe();
  }

  getQuestions() {
    this.questionRestService
      .getQuestions({ tagIds: this.selectedTags.join(',') })
      .pipe(
        tap((questions) => {
          this.questions = questions;
          this.setquestionsDisplay(this.mapQuestionsToDisplay(questions));
        }),
        tap(() => (this.associatedQuestionsCount = this.questionsDisplay.filter((q) => q.isChecked).length)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  changeTab(num: number) {
    this.currentStep = num;
    if (this.currentStep === 2) {
      this.selectedTags = this.programForm.value?.tags ?? [];
      this.getQuestions();
    }
  }

  goNext() {
    if (this.isEdit) {
      this.saveProgram();
    }
    this.currentStep++;
    if (this.currentStep === 2) {
      this.selectedTags = this.programForm.value?.tags ?? [];
      this.getQuestions();
    } else if (this.currentStep === 3) {
      this.saveProgram();
    }
  }

  searchQuestions(value: string) {
    this.setquestionsDisplay(
      this.mapQuestionsToDisplay(
        this.questions.filter((q) => q.title.toLowerCase().includes(value.toLowerCase())),
      ),
    );
  }

  setquestionsDisplay(quest: QuestionDisplay[]) {
    this.questionsDisplay = quest.sort((a, b) => (a.isChecked ? -1 : 1));
  }

  addOrRemoveQuestion(questionId: string, toDelete: any) {
    if (this.isEdit) {
      this.programRestService
        .addOrRemoveQuestion(this.editedProgram.id, questionId, toDelete)
        .pipe(
          tap(() => this.getQuestions()),
          untilDestroyed(this),
        )
        .subscribe();
    } else {
      this.questionList = this.questionList.filter((q) => q.id !== questionId);
      if (!toDelete) {
        this.questionList.push({ id: questionId, delete: toDelete });
      }
    }
  }

  delete() {
    // this.programRestService.deleteProgram(this.editedProgram.id).pipe(untilDestroyed(this)).subscribe();
  }

  cancel() {
    this.location.back();
  }

  copyToClipBoard() {
    navigator.clipboard.writeText(window.location.href);
  }

  mapQuestionsToDisplay(questions: QuestionDtoApi[]): QuestionDisplay[] {
    return questions.map((q) => ({
      id: q.id,
      title: q.title,
      isChecked: (this.isEdit ? q.programs?.some((p) => p.id === this.editedProgram.id) : false) ?? false,
    }));
  }

  findTagName(id: string) {
    return this.programStore.tags.value.find((t) => t.id === id)?.name;
  }
  findTeamName(id: string) {
    return this.teamStore.teams.value.find((t) => t.id === id)?.shortName;
  }
  getquestionsCount(): number {
    if (this.isEdit) {
      return this.associatedQuestionsCount;
    } else {
      return this.questionList.length;
    }
  }
}
