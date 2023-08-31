import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  PriorityEnumApi,
  ProgramDtoApi,
  ProgramDtoApiPriorityEnumApi,
  QuestionDtoApi,
  QuestionDtoPaginatedResponseApi,
  TeamApi,
} from '@usealto/sdk-ts-angular';
import { Observable, combineLatest, filter, map, of, switchMap, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns, getTranslation } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ReplaceInTranslationPipe } from '../../../../core/utils/i18n/replace-in-translation.pipe';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { ProgramForm } from '../../models/programs.form';
import { QuestionDisplay } from '../../models/question.model';
import { ProgramsStore } from '../../programs.store';
import { ProgramsRestService } from '../../services/programs-rest.service';
import { QuestionsRestService } from '../../services/questions-rest.service';
import { QuestionFormComponent } from '../questions/question-form/question-form.component';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';

@UntilDestroy()
@Component({
  selector: 'alto-create-programs',
  templateUrl: './create-programs.component.html',
  styleUrls: ['./create-programs.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class CreateProgramsComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;
  AltoRoutes = AltoRoutes;
  private fb: IFormBuilder;

  programForm!: IFormGroup<ProgramForm>;
  currentStep = 1;
  editedProgram?: ProgramDtoApi;
  isEdit = false;

  questions!: QuestionDtoApi[];
  questionsAssiciated!: QuestionDtoApi[];
  questionsDisplay?: QuestionDtoPaginatedResponseApi;
  questionsAssociatedDisplay?: QuestionDtoPaginatedResponseApi;
  questionList: { id: string; delete: boolean; isNewQuestion: boolean }[] = [];
  questionPageSize = 10;
  questionPage = 1;
  questionAssociatedPage = 1;

  selectedTags: string[] = [];
  questionSearch = '';
  questionAssociatedSearch = '';

  constructor(
    readonly fob: UntypedFormBuilder,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly programRestService: ProgramsRestService,
    private readonly questionRestService: QuestionsRestService,
    private readonly route: ActivatedRoute,
    private readonly location: Location,
    public programStore: ProgramsStore,
    public teamStore: TeamStore,
    private modalService: NgbModal,
    private replaceInTranslationPipe: ReplaceInTranslationPipe,
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
        tap((p) => {
          this.editedProgram = p;
        }),
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
      expectation: [program?.expectation ?? 70, [Validators.required]],
      tags: [[]],
      teams: [program?.teams?.map((t) => t.id) ?? []],
    });
  }

  saveProgram() {
    if (!this.programForm.value) {
      return;
    }
    const { teams, priority, ...rest } = this.programForm.value;

    delete rest['tags'];

    const progValues = {
      ...rest,
      priority: priority as string as PriorityEnumApi,
      teams: teams.map((id) => ({ id } as TeamApi)),
    };

    let obs$: Observable<any>;

    if (this.isEdit && this.editedProgram) {
      obs$ = !this.programForm.touched
        ? of(null)
        : this.programRestService.updateProgram(this.editedProgram.id, progValues);
    } else {
      obs$ = this.programRestService.createProgram(progValues);
    }
    let progId = '';
    obs$
      .pipe(
        filter((x) => !!x),
        map((d) => d.data),
        switchMap((prog: ProgramDtoApi) => {
          progId = prog.id;
          if (!this.isEdit) {
            // add questionList to the program
            return combineLatest(
              this.questionList.map((q) => this.programRestService.addOrRemoveQuestion(prog.id, q.id, false)),
            );
          } else {
            return of(null);
          }
        }),
        tap(() => {
          this.isEdit = true;
        }),
        switchMap(() => this.programRestService.getProgram(progId)),
        tap((prog: ProgramDtoApi) => {
          this.editedProgram = prog;
          this.programStore.programs.value = [];
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  openQuestionForm(question?: QuestionDisplay) {
    let isQuestionEdit = false;
    const canvasRef = this.offcanvasService.open(QuestionFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });
    if (question) {
      canvasRef.componentInstance.question =
        this.questions.find((q) => q.id === question?.id) ||
        this.questionsAssiciated.find((q) => q.id === question?.id);
      isQuestionEdit = true;
    }

    if (this.isEdit && this.editedProgram) {
      canvasRef.componentInstance.program = this.editedProgram;
    } else {
      canvasRef.componentInstance.isNewProgram = true;
    }

    canvasRef.componentInstance.createdQuestion
      .pipe(
        tap((newQuestion: QuestionDtoApi) => {
          //if it's a new question, add it to the list
          if (!isQuestionEdit) {
            this.questionList = this.questionList.filter((q) => q.id !== newQuestion.id);
            this.questionList.push({ id: newQuestion.id, delete: false, isNewQuestion: true });

            // We keep the form open after question's creation
            this.openQuestionForm();
          }

          // refresh the program
          this.refreshProgram();

          // refresh the questions list
          this.getQuestions();
          this.getAssociatedQuestions();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  tagChange(e: string[]) {
    this.selectedTags = e;
    this.getQuestions();
  }

  getQuestions() {
    this.questionRestService
      .getQuestionsPaginated({
        tagIds: this.selectedTags.join(','),
        sortByProgramId: this.editedProgram?.id ?? undefined,
        notInProgramIds: this.editedProgram?.id ?? undefined,
        itemsPerPage: this.questionPageSize,
        page: this.questionPage,
        search: this.questionSearch,
      })

      .pipe(
        tap((questions) => {
          const { data = [] } = questions;
          this.questions = data;
          this.questionsDisplay = questions;
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  getAssociatedQuestions() {
    if (!this.isEdit) {
      return;
    }
    this.questionRestService
      .getQuestionsPaginated({
        tagIds: this.selectedTags.join(','),
        itemsPerPage: this.questionPageSize,
        programIds: this.editedProgram?.id ?? undefined,
        page: this.questionAssociatedPage,
        search: this.questionSearch,
      })
      .pipe(
        tap((associatedQuestions) => {
          this.questionsAssociatedDisplay = associatedQuestions;
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  changeTab(num: number) {
    this.currentStep = num;
    if (this.currentStep === 2) {
      this.selectedTags = this.programForm.value?.tags ?? [];
      this.getQuestions();
      this.getAssociatedQuestions();
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
      this.getAssociatedQuestions();
    } else if (this.currentStep === 3) {
      this.saveProgram();
    }
  }

  searchQuestions(value: string) {
    this.questionSearch = value;
    this.getQuestions();
  }

  questionPageChange(e: number) {
    this.questionPage = e;
    this.getQuestions();
  }

  searchAssociatedQuestions(value: string) {
    this.questionAssociatedSearch = value;
    this.getAssociatedQuestions();
  }

  associatedQuestionPageChange(e: number) {
    this.questionAssociatedPage = e;
    this.getAssociatedQuestions();
  }

  addOrRemoveQuestion({ questionId, toDelete }: { questionId: string; toDelete: boolean }) {
    this.questionList = this.questionList.filter((q) => q.id !== questionId);
    if (!toDelete) {
      this.questionList.push({ id: questionId, delete: toDelete, isNewQuestion: false });
    }
    if (this.isEdit && this.editedProgram) {
      this.programRestService
        .addOrRemoveQuestion(this.editedProgram.id, questionId, toDelete)
        .pipe(
          tap(() => {
            this.getQuestions();
            this.getAssociatedQuestions();
            this.refreshProgram();
          }),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  delete() {
    if (!this.editedProgram) {
      return;
    }
    const { id, name, teams } = this.editedProgram;

    const modalRef = this.modalService.open(DeleteModalComponent, { centered: true, size: 'md' });

    const componentInstance = modalRef.componentInstance as DeleteModalComponent;
    componentInstance.data = {
      title: this.replaceInTranslationPipe.transform(I18ns.programs.delete.title, name),
      subtitle: this.replaceInTranslationPipe.transform(
        I18ns.programs.delete.subtitle,
        teams.length.toString(),
      ),
    };

    componentInstance.objectDeleted
      .pipe(
        switchMap(() => this.programRestService.deleteProgram(id)),
        tap(() => {
          this.programRestService.resetCache();
          modalRef.close();
          this.location.back();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  cancel() {
    this.location.back();
  }

  copyToClipBoard() {
    navigator.clipboard.writeText(window.location.href);
  }

  findTagName(id: string) {
    return this.programStore.tags.value.find((t) => t.id === id)?.name;
  }

  @memoize()
  mapTeams(ids: string[]) {
    return this.teamStore.teams.value.filter((t) => ids.some((x) => x === t.id));
  }

  @memoize()
  getPriorityClass(prio: ProgramDtoApiPriorityEnumApi | null) {
    switch (prio) {
      case ProgramDtoApiPriorityEnumApi.High:
        return 'pill-red';
      case ProgramDtoApiPriorityEnumApi.Medium:
        return 'pill-orange';
      case ProgramDtoApiPriorityEnumApi.Low:
        return 'pill-green';
      default:
        return '';
    }
  }

  @memoize()
  getPriorityName(p: ProgramDtoApiPriorityEnumApi | null) {
    if (!p) {
      return '';
    }
    return getTranslation(I18ns.shared.priorities, p.toLowerCase());
  }

  refreshProgram() {
    if (this.editedProgram) {
      this.programRestService.getProgram(this.editedProgram.id).subscribe((p) => {
        this.editedProgram = p;
      });
    }
  }
}
