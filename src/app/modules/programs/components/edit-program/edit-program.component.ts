import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EResolvers, ResolversService } from '../../../../core/resolvers/resolvers.service';
import { IEditProgramData } from '../../../../core/resolvers/edit-program.resolver';
import { Program } from '../../../../models/program.model';
import { I18ns, getTranslation } from '../../../../core/utils/i18n/I18n';
import { EmojiName } from '../../../../core/utils/emoji/data';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/services/validation.service';
import { IAppData } from '../../../../core/resolvers';
import {
  PriorityEnumApi,
  ProgramDtoApiPriorityEnumApi,
  QuestionDtoApi,
  TagDtoApi,
} from '@usealto/sdk-ts-angular';
import { ITabOption } from '../../../shared/components/tabs/tabs.component';
import { EColors, PillOption, SelectOption } from '../../../shared/models/select-option.model';
import {
  Observable,
  Subscription,
  combineLatest,
  debounceTime,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { TagsRestService } from '../../services/tags-rest.service';
import { ProgramsRestService } from '../../services/programs-rest.service';
import { Store } from '@ngrx/store';
import * as FromRoot from '../../../../core/store/store.reducer';
import { setPrograms } from '../../../../core/store/root/root.action';
import { EPlaceholderStatus } from '../../../shared/components/placeholder-manager/placeholder-manager.component';
import { QuestionsRestService } from '../../services/questions-rest.service';

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

  program?: Program;

  tabsOptions: ITabOption[] = [
    { value: Etab.Informations, label: I18ns.programs.forms.step1.title },
    { value: Etab.Questions, label: I18ns.programs.forms.step2.title },
    { value: Etab.Summary, label: I18ns.programs.forms.step3.title },
  ];
  tabsControl = new FormControl<ITabOption>(this.tabsOptions[0], { nonNullable: true });

  programs: Program[] = [];

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

  programFormGroup = new FormGroup({
    nameControl: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        this.validationService.uniqueStringValidation(
          this.programs.map((p) => p.name),
          'nameNotAllowed',
        ),
      ],
    }),
    expectationControl: new FormControl<number>(75, { nonNullable: true, validators: Validators.required }),
    priorityControl: new FormControl<SelectOption | null>(null, {
      validators: Validators.required,
    }),
    teamControls: new FormControl<FormControl<PillOption>[]>([], { nonNullable: true }),
  });

  associatedQuestionsDataStatus = EPlaceholderStatus.LOADING;
  associatedQuestionsSearchControl = new FormControl<string>('', { nonNullable: true });
  associatedQuestionsPageControl = new FormControl<number>(1, { nonNullable: true });
  associatedQuestions: QuestionDtoApi[] = [];
  associatedQuestionsCount = 0;

  questionsDataStatus = EPlaceholderStatus.LOADING;
  questionsSearchControl = new FormControl<string>('', { nonNullable: true });
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
    const company = (data[EResolvers.AppResolver] as IAppData).company;
    this.program = (data[EResolvers.EditProgramResolver] as IEditProgramData).program;
    this.programs = company.programs;

    this.programFormSubscription.add(
      this.tagsRestService
        .getTags()
        .pipe(
          tap((tags: TagDtoApi[]) => {
            this.tagOptions = tags.map(
              (tag) =>
                ({
                  value: tag.id,
                  label: tag.name,
                  color: EColors.primary,
                } as PillOption),
            );

            this.teamOptions = company.teams.map(
              (team) =>
                ({
                  label: team.name,
                  value: team.id,
                  color: EColors.primary,
                } as PillOption),
            );
          }),
        )
        .subscribe(() => {
          if (this.program) {
            const programTeams = company.teams.filter((team) => this.program?.teamIds.includes(team.id));
            this.programFormGroup.setValue({
              nameControl: this.program.name,
              expectationControl: this.program.expectation,
              priorityControl: {
                value: this.program.priority,
                label: getTranslation(I18ns.shared.priorities, this.program.priority.toLowerCase()),
              } as SelectOption,
              teamControls: programTeams.map(
                (team) =>
                  new FormControl<PillOption>(
                    {
                      value: team.id,
                      label: team.name,
                      color: EColors.primary,
                    } as PillOption,
                    { nonNullable: true },
                  ),
              ),
            });
          }
        }),
    );

    this.programFormSubscription.add(
      combineLatest([
        this.associatedQuestionsPageControl.valueChanges.pipe(
          startWith(this.associatedQuestionsPageControl.value),
        ),
        this.associatedQuestionsSearchControl.valueChanges.pipe(
          startWith(this.associatedQuestionsSearchControl.value),
          debounceTime(200),
          tap(() => this.associatedQuestionsPageControl.patchValue(1)),
        ),
      ])
        .pipe(
          switchMap(([page, search]) => {
            return this.questionsRestService.getQuestionsPaginated({
              itemsPerPage: 10,
              page: page,
              programIds: this.program?.id,
              search: search,
            });
          }),
          map((res) => {
            this.associatedQuestionsCount = res.meta.totalItems;
            return res.data;
          }),
        )
        .subscribe((associatedQuestions) => {
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
        this.questionsSearchControl.valueChanges.pipe(
          startWith(this.questionsSearchControl.value),
          debounceTime(200),
          tap(() => this.questionsPageControl.patchValue(1)),
        ),
      ])
        .pipe(
          switchMap(([page, search]) => {
            return this.questionsRestService.getQuestionsPaginated({
              itemsPerPage: 10,
              page: page,
              tagIds: this.tagControls.value.map((tagControl) => tagControl.value.value).join(','),
              search: search,
            });
          }),
          map((res) => {
            this.questionsCount = res.meta.totalItems;
            return res.data;
          }),
        )
        .subscribe((questions) => {
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
      teamIds: teamControls.value.map((teamControl) => teamControl.value.value).map((id) => ({ id: id })),
      expectation: expectationControl.value,
    };

    let $obs: Observable<any>;

    if (this.program) {
      $obs = this.programFormGroup.dirty
        ? this.programRestService.updateProgram(this.program.id, newProg)
        : of(null);
    } else {
      $obs = this.programRestService.createProgram(newProg);
    }

    $obs.pipe(map((res) => Program.fromDto(res.data))).subscribe((updatedProgram) => {
      const newPrograms = [...this.programs];

      if (this.program) {
        const indexToUpdate = this.programs.findIndex((p) => p.id === this.program?.id);
        newPrograms[indexToUpdate] = updatedProgram;
      } else {
        newPrograms.push(updatedProgram);
      }

      this.store.dispatch(setPrograms({ programs: newPrograms }));
      this.program = updatedProgram;

      this.switchTab({ value: Etab.Questions, label: I18ns.programs.forms.step2.title });
    });
  }

  cancel(): void {
    this.location.back();
  }

  switchTab(option: ITabOption): void {
    //submit le form si on créé un nouveau programme
    this.tabsControl.setValue(option);
  }
}
