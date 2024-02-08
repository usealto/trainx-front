import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { PriorityEnumApi, ProgramDtoApiPriorityEnumApi, QuestionDtoApi } from '@usealto/sdk-ts-angular';
import {
  Observable,
  Subscription,
  combineLatest,
  concat,
  debounceTime,
  filter,
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
import { addProgram } from '../../../../core/store/root/root.action';
import * as FromRoot from '../../../../core/store/store.reducer';
import { EmojiName } from '../../../../core/utils/emoji/data';
import { I18ns, getTranslation } from '../../../../core/utils/i18n/I18n';
import { Program } from '../../../../models/program.model';
import { EPlaceholderStatus } from '../../../shared/components/placeholder-manager/placeholder-manager.component';
import { ITabOption } from '../../../shared/components/tabs/tabs.component';
import { PillOption, SelectOption } from '../../../shared/models/select-option.model';
import { ValidationService } from '../../../shared/services/validation.service';
import { ProgramsRestService } from '../../services/programs-rest.service';
import { QuestionsRestService } from '../../services/questions-rest.service';
import { TagsRestService } from '../../services/tags-rest.service';
import { Company } from '../../../../models/company.model';
import { Team } from '../../../../models/team.model';

enum Etab {
  Informations = 'informations',
  Questions = 'questions',
  Summary = 'summary',
}

@Component({
  selector: 'alto-edit-program',
  templateUrl: './edit-program.component.html',
  styleUrls: ['./edit-program.component.scss'],
})
export class EditProgramsComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;
  ETab = Etab;
  EPlaceholderStatus = EPlaceholderStatus;

  private readonly programFormSubscription = new Subscription();

  company!: Company;
  program?: Program;

  tabsOptions: ITabOption[] = [
    { value: Etab.Informations, label: I18ns.programs.forms.step1.title },
    { value: Etab.Questions, label: I18ns.programs.forms.step2.title },
    { value: Etab.Summary, label: I18ns.programs.forms.step3.title },
  ];
  tabsControl = new FormControl<ITabOption>(this.tabsOptions[0], { nonNullable: true });

  tagOptions: PillOption[] = [];
  tagControls: FormControl<FormControl<PillOption>[]> = new FormControl([], { nonNullable: true });
  teamOptions: PillOption[] = [];
  priorityOptions: SelectOption[] = Object.values(ProgramDtoApiPriorityEnumApi).map(
    (p) =>
      ({
        value: p,
        label: getTranslation(I18ns.shared.priorities, p.toLowerCase()),
      } as SelectOption),
  );

  programFormGroup!: FormGroup<{
    nameControl: FormControl<string>;
    expectationControl: FormControl<number>;
    priorityControl: FormControl<SelectOption | null>;
    teamControls: FormControl<FormControl<PillOption>[]>;
  }>;

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

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly validationService: ValidationService,
    private readonly tagsRestService: TagsRestService,
    private readonly location: Location,
    private readonly programRestService: ProgramsRestService,
    private readonly questionsRestService: QuestionsRestService,
    private readonly store: Store<FromRoot.AppState>,
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
            this.company.programs.map((p) => p.name),
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
          ? ({
              value: this.program.priority,
              label: getTranslation(I18ns.shared.priorities, this.program.priority.toLowerCase()),
            } as SelectOption)
          : null,
        {
          validators: Validators.required,
        },
      ),
      teamControls: new FormControl<FormControl<PillOption>[]>(
        this.program
          ? this.program.teamIds.map((teamId) => {
              const team = this.company.teamById.get(teamId) as Team;
              return new FormControl<PillOption>(
                {
                  value: team.id,
                  label: team.name,
                  pillColor: PillOption.getPrimaryPillColor(),
                } as PillOption,
                { nonNullable: true },
              );
            })
          : [],
        { nonNullable: true },
      ),
    });

    this.programFormSubscription.add(
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
              itemsPerPage: 10,
              page,
              programIds: (this.program as Program).id,
              search: search || undefined,
            });
          }),
        )
        .subscribe(({ data: associatedQuestions, meta }) => {
          this.associatedQuestionsCount = meta.totalItems;
          this.associatedQuestions = associatedQuestions ?? [];
          this.associatedQuestionsDataStatus = associatedQuestions
            ? EPlaceholderStatus.GOOD
            : this.associatedQuestionsSearchControl.value !== ''
            ? EPlaceholderStatus.NO_RESULT
            : EPlaceholderStatus.NO_DATA;
        }),
    );

    this.programFormSubscription.add(
      combineLatest([
        this.questionsPageControl.valueChanges.pipe(startWith(this.questionsPageControl.value)),
        concat(
          of(this.questionsSearchControl.value),
          this.questionsSearchControl.valueChanges.pipe(
            debounceTime(200),
            tap(() => this.questionsPageControl.patchValue(1)),
          ),
        ),
      ])
        .pipe(
          filter(() => !!this.program),
          switchMap(([page, search]) => {
            return this.questionsRestService.getQuestionsPaginated({
              itemsPerPage: 10,
              page,
              tagIds: this.tagControls.value.map((tagControl) => tagControl.value.value).join(','),
              search: search || undefined,
              notInProgramIds: (this.program as Program).id,
            });
          }),
        )
        .subscribe(({ data: questions, meta }) => {
          this.questionsCount = meta.totalItems;
          this.questions = questions ?? [];
          this.questionsDataStatus = questions
            ? EPlaceholderStatus.GOOD
            : this.questionsSearchControl.value !== ''
            ? EPlaceholderStatus.NO_RESULT
            : EPlaceholderStatus.NO_DATA;
        }),
    );
  }

  submitForm(): void {
    const { nameControl, expectationControl, priorityControl, teamControls } = this.programFormGroup.controls;

    const newProg = {
      name: nameControl.value,
      priority: priorityControl.value?.value as PriorityEnumApi,
      teamIds: teamControls.value.map((teamControl) => teamControl.value.value).map((id) => ({ id })),
      expectation: expectationControl.value,
    };

    // let $obs: Observable<any>;

    // if (this.program) {
    //   $obs = this.programFormGroup.dirty
    //     ? this.programRestService.updateProgram(this.program.id, newProg)
    //     : of(null);
    // } else {
    //   $obs = this.programRestService.createProgram(newProg);
    // }

    // $obs.pipe(map((res) => Program.fromDto(res.data))).subscribe((updatedProgram) => {
    //   this.store.dispatch(addProgram({ program: updatedProgram }));
    //   this.program = updatedProgram;

    //   this.switchTab(this.tabsOptions[1]);
    // });

    (this.program
      ? this.programRestService.updateProgram(this.program.id, newProg)
      : this.programRestService.createProgram(newProg)
    )
      .pipe(
        switchMap((updatedProgram) => {
          this.store.dispatch(addProgram({ program: updatedProgram }));

          return this.store
            .select(FromRoot.selectCompany)
            .pipe(map(({ data: company }) => company.programById.get(updatedProgram.id) as Program));
        }),
      )
      .subscribe((updatedProgram) => {
        this.program = updatedProgram;

        this.switchTab(this.tabsOptions[1]);
      });
  }

  cancel(): void {
    this.location.back();
  }

  switchTab(option: ITabOption): void {
    if (this.program) {
      this.tabsControl.setValue(option);
    }
  }
}
