import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { PriorityEnumApi, ProgramDtoApiPriorityEnumApi, QuestionDtoApi } from '@usealto/sdk-ts-angular';
import {
  Subscription,
  combineLatest,
  concat,
  debounceTime,
  filter,
  first,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { IAppData } from '../../../../core/resolvers';
import { IEditProgramData } from '../../../../core/resolvers/edit-program.resolver';
import { ILeadData } from '../../../../core/resolvers/lead.resolver';
import { EResolvers, ResolversService } from '../../../../core/resolvers/resolvers.service';
import { addProgram, deleteProgram } from '../../../../core/store/root/root.action';
import * as FromRoot from '../../../../core/store/store.reducer';
import { EmojiName } from '../../../../core/utils/emoji/data';
import { I18ns, getTranslation } from '../../../../core/utils/i18n/I18n';
import { Company } from '../../../../models/company.model';
import { Program } from '../../../../models/program.model';
import { Team } from '../../../../models/team.model';
import { EPlaceholderStatus } from '../../../shared/components/placeholder-manager/placeholder-manager.component';
import { ITabOption } from '../../../shared/components/tabs/tabs.component';
import { PillOption, SelectOption } from '../../../shared/models/select-option.model';
import { ValidationService } from '../../../shared/services/validation.service';
import { ProgramsRestService } from '../../services/programs-rest.service';
import { QuestionsRestService } from '../../services/questions-rest.service';
import { QuestionFormComponent } from '../create-questions/question-form.component';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { ReplaceInTranslationPipe } from '../../../../core/utils/i18n/replace-in-translation.pipe';
import { ToastService } from '../../../../core/toast/toast.service';

enum Etab {
  Informations = 'informations',
  Questions = 'questions',
  Summary = 'summary',
}

@Component({
  selector: 'alto-edit-program',
  templateUrl: './edit-program.component.html',
  styleUrls: ['./edit-program.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class EditProgramsComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;
  ETab = Etab;
  EPlaceholderStatus = EPlaceholderStatus;

  company!: Company;
  program?: Program;

  tabsOptions: ITabOption[] = [
    { value: Etab.Informations, label: I18ns.programs.forms.step1.title },
    { value: Etab.Questions, label: I18ns.programs.forms.step2.title },
    { value: Etab.Summary, label: I18ns.programs.forms.step3.title },
  ];
  tabsControl = new FormControl<ITabOption>(this.tabsOptions[0], { nonNullable: true });

  // Informations tab
  programFormGroup!: FormGroup<{
    nameControl: FormControl<string>;
    expectationControl: FormControl<number>;
    priorityControl: FormControl<SelectOption | null>;
    teamControls: FormControl<FormControl<PillOption>[]>;
  }>;
  teamOptions: PillOption[] = [];

  priorityOptions: SelectOption[] = [
    new SelectOption({
      value: ProgramDtoApiPriorityEnumApi.High,
      label: getTranslation(I18ns.shared.priorities, ProgramDtoApiPriorityEnumApi.High),
    }),
    new SelectOption({
      value: ProgramDtoApiPriorityEnumApi.Medium,
      label: getTranslation(I18ns.shared.priorities, ProgramDtoApiPriorityEnumApi.Medium),
    }),
    new SelectOption({
      value: ProgramDtoApiPriorityEnumApi.Low,
      label: getTranslation(I18ns.shared.priorities, ProgramDtoApiPriorityEnumApi.Low),
    }),
  ];

  // Questions tab
  readonly questionsPageSize = 10;

  associatedQuestionsDataStatus = EPlaceholderStatus.LOADING;
  associatedQuestionsSearchControl = new FormControl<string | null>(null);
  associatedQuestionsPageControl = new FormControl<number>(1, { nonNullable: true });
  associatedQuestions: QuestionDtoApi[] = [];
  associatedQuestionsCount = 0;

  questionsDataStatus = EPlaceholderStatus.LOADING;
  questionsSearchControl = new FormControl<string | null>(null);
  questionsPageControl = new FormControl<number>(1, { nonNullable: true });
  questions: QuestionDtoApi[] = [];
  questionsCount = 0;

  tagOptions: PillOption[] = [];
  tagControls: FormControl<FormControl<PillOption>[]> = new FormControl([], { nonNullable: true });

  private readonly editProgramComponentSubscription = new Subscription();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly validationService: ValidationService,
    private readonly location: Location,
    private readonly programRestService: ProgramsRestService,
    private readonly questionsRestService: QuestionsRestService,
    private readonly store: Store<FromRoot.AppState>,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly modalService: NgbModal,
    private readonly toastService: ToastService,
    private readonly replaceInTranslationPipe: ReplaceInTranslationPipe,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    const tags = (data[EResolvers.LeadResolver] as ILeadData).tags;
    this.company = (data[EResolvers.AppResolver] as IAppData).company;
    this.program = (data[EResolvers.EditProgramResolver] as IEditProgramData).program;

    this.tagOptions = tags.map(
      (tag) =>
        new PillOption({
          value: tag.id,
          label: tag.name,
          pillColor: PillOption.getPrimaryPillColor(),
        }),
    );

    this.teamOptions = this.company.teams.map(
      (team) =>
        new PillOption({
          label: team.name,
          value: team.id,
          pillColor: PillOption.getPillColorFromId(team.id),
        }),
    );

    this.programFormGroup = new FormGroup({
      nameControl: new FormControl<string>(this.program ? this.program.name : '', {
        nonNullable: true,
        validators: [
          Validators.required,
          this.validationService.uniqueStringValidation(
            this.company.programs
              .filter(({ id }) => (this.program ? id !== this.program.id : true))
              .map((p) => p.name),
            I18ns.programs.forms.step1.duplicateName,
          ),
        ],
      }),
      expectationControl: new FormControl<number>(this.program ? this.program.expectation : 75, {
        nonNullable: true,
        validators: Validators.required,
      }),
      priorityControl: new FormControl<SelectOption | null>(
        this.program
          ? (this.priorityOptions.find(
              (priorityOption) => priorityOption.value === this.program?.priority,
            ) as SelectOption)
          : null,
        {
          validators: Validators.required,
        },
      ),
      teamControls: new FormControl<FormControl<PillOption>[]>(
        this.program
          ? this.teamOptions
              .filter((teamOption) => this.program?.teamIds.includes(teamOption.value))
              .map((teamOption) => {
                return new FormControl<PillOption>(teamOption, { nonNullable: true });
              })
          : [],
        { nonNullable: true },
      ),
    });

    this.editProgramComponentSubscription.add(
      combineLatest([
        this.associatedQuestionsPageControl.valueChanges.pipe(
          startWith(this.associatedQuestionsPageControl.value),
        ),
        concat(
          of(this.associatedQuestionsSearchControl.value),
          this.associatedQuestionsSearchControl.valueChanges.pipe(
            debounceTime(200),
            tap(() => this.associatedQuestionsPageControl.patchValue(1)),
          ),
        ),
      ])
        .pipe(
          filter(() => !!this.program),
          switchMap(([page, search]) => {
            return this.questionsRestService.getQuestionsPaginated({
              itemsPerPage: this.questionsPageSize,
              page,
              programIds: (this.program as Program).id,
              search: search || undefined,
            });
          }),
        )
        .subscribe(({ data: associatedQuestions = [], meta }) => {
          this.associatedQuestionsCount = meta.totalItems;
          this.associatedQuestions = associatedQuestions;
          this.associatedQuestionsDataStatus = associatedQuestions.length
            ? EPlaceholderStatus.GOOD
            : this.associatedQuestionsSearchControl.value !== ''
            ? EPlaceholderStatus.NO_RESULT
            : EPlaceholderStatus.NO_DATA;
        }),
    );

    this.editProgramComponentSubscription.add(
      combineLatest([
        this.questionsPageControl.valueChanges.pipe(startWith(this.questionsPageControl.value)),
        concat(
          of(this.questionsSearchControl.value),
          this.questionsSearchControl.valueChanges.pipe(
            debounceTime(200),
            tap(() => this.questionsPageControl.patchValue(1)),
          ),
        ),
        this.tagControls.valueChanges.pipe(
          startWith(this.tagControls.value),
          map((tagControls) => tagControls.map((tagControl) => tagControl.value.value)),
        ),
      ])
        .pipe(
          filter(() => !!this.program),
          switchMap(([page, search, selectedTagsIds]) => {
            return this.questionsRestService.getQuestionsPaginated({
              itemsPerPage: this.questionsPageSize,
              page,
              tagIds: selectedTagsIds.length ? selectedTagsIds.join(',') : undefined,
              search: search || undefined,
              notInProgramIds: (this.program as Program).id,
            });
          }),
        )
        .subscribe(({ data: questions = [], meta }) => {
          this.questionsCount = meta.totalItems;
          this.questions = questions;
          this.questionsDataStatus = questions.length
            ? EPlaceholderStatus.GOOD
            : this.questionsSearchControl.value !== ''
            ? EPlaceholderStatus.NO_RESULT
            : EPlaceholderStatus.NO_DATA;
        }),
    );
  }

  cancel(): void {
    this.location.back();
  }

  switchTab(option: ITabOption): void {
    if (this.program) {
      this.tabsControl.setValue(option);
      if (option === this.tabsOptions[1]) {
        this.resetQuestionsTab();
      }
    }
  }

  // INFORMATIONS TAB
  submitForm(): void {
    const createMode = !this.program;
    const { nameControl, expectationControl, priorityControl, teamControls } = this.programFormGroup.controls;

    const newProg = {
      name: nameControl.value,
      priority: priorityControl.value?.value as PriorityEnumApi,
      teamIds: teamControls.value.map((teamControl) => teamControl.value.value).map((id) => ({ id })),
      expectation: expectationControl.value,
    };

    (this.program
      ? this.programRestService.updateProgram(this.program.id, newProg)
      : this.programRestService.createProgram(newProg)
    )
      .pipe(
        switchMap((updatedProgram) => {
          this.store.dispatch(addProgram({ program: updatedProgram }));

          return combineLatest([of(updatedProgram.id), this.store.select(FromRoot.selectCompany)]);
        }),
        first(),
      )
      .subscribe({
        next: ([updatedProgramId, { data: company }]) => {
          this.program = company.programById.get(updatedProgramId) as Program;
        },
        complete: () => {
          if (this.tabsControl.value === this.tabsOptions[0] && createMode) {
            this.switchTab(this.tabsOptions[1]);
          } else {
            this.toastService.show({
              type: 'success',
              text: I18ns.programs.forms.step3.validatedToast,
            });
          }
        },
      });
  }

  // QUESTIONS TAB
  openQuestionForm(question?: QuestionDtoApi): void {
    const canvasRef = this.offcanvasService.open(QuestionFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    const instance = canvasRef.componentInstance;
    instance.question = question;
    instance.createdQuestion.subscribe({
      next: () => {
        this.resetQuestionsTab();
      },
    });
  }

  addAssociatedQuestion(question: QuestionDtoApi): void {
    this.programRestService.addQuestionToProgram(this.program?.id as string, question.id).subscribe({
      next: () => {
        this.resetQuestionsTab();
      },
    });
  }

  removeAssociatedQuestion(question: QuestionDtoApi): void {
    this.programRestService.removeQuestionFromProgram(this.program?.id as string, question.id).subscribe({
      next: () => {
        this.resetQuestionsTab();
      },
    });
  }

  resetAssociatedQuestionsSearch(): void {
    this.associatedQuestionsSearchControl.patchValue(null);
  }

  resetQuestionsSearch(): void {
    this.questionsSearchControl.patchValue(null);
  }

  private resetQuestionsTab(): void {
    this.resetAssociatedQuestionsSearch();
    this.resetQuestionsSearch();
  }

  // SUMMARY TAB
  deleteProgram(): void {
    const modalRef = this.modalService.open(DeleteModalComponent, {
      centered: true,
      size: 'md',
    });
    const componentInstance = modalRef.componentInstance as DeleteModalComponent;
    componentInstance.data = {
      title: this.replaceInTranslationPipe.transform(
        I18ns.programs.delete.title,
        this.program?.name as string,
      ),
      subtitle: this.replaceInTranslationPipe.transform(
        I18ns.programs.delete.subtitle,
        this.program?.teamIds.length.toString(),
      ),
    };

    componentInstance.objectDeleted
      .pipe(
        switchMap(() => {
          return this.programRestService.deleteProgram(this.program?.id as string);
        }),
      )
      .subscribe({
        next: () => {
          this.store.dispatch(deleteProgram({ programId: this.program?.id as string }));
          this.location.back();
          this.toastService.show({
            type: 'success',
            text: I18ns.programs.delete.success,
          });
        },
        error: () => {
          this.toastService.show({
            type: 'danger',
            text: I18ns.programs.delete.error,
          });
        },
      });
  }
}
