import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import {
  PriorityEnumApi,
  ProgramDtoApiPriorityEnumApi,
  ProgramStatsDtoApi,
  QuestionDtoApi,
} from '@usealto/sdk-ts-angular';
import { format } from 'date-fns';
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
import { ETab, IEditProgramData } from '../../../../core/resolvers/edit-program.resolver';
import { ILeadData } from '../../../../core/resolvers/lead.resolver';
import { EResolvers, ResolversService } from '../../../../core/resolvers/resolvers.service';
import { addProgram, deleteProgram, launchAcceleratedProgram } from '../../../../core/store/root/root.action';
import * as FromRoot from '../../../../core/store/store.reducer';
import { ToastService } from '../../../../core/toast/toast.service';
import { EmojiName } from '../../../../core/utils/emoji/data';
import { I18ns, getTranslation } from '../../../../core/utils/i18n/I18n';
import { ReplaceInTranslationPipe } from '../../../../core/utils/i18n/replace-in-translation.pipe';
import { Company } from '../../../../models/company.model';
import { Program } from '../../../../models/program.model';
import { EScoreDuration } from '../../../../models/score.model';
import { TriggersService } from '../../../settings/services/triggers.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { ELoadingStatus } from '../../../shared/components/load-spinner/load-spinner.component';
import { EPlaceholderStatus } from '../../../shared/components/placeholder-manager/placeholder-manager.component';
import { ITabOption } from '../../../shared/components/tabs/tabs.component';
import { PillOption, SelectOption } from '../../../shared/models/select-option.model';
import { ScoresRestService } from '../../../shared/services/scores-rest.service';
import { ValidationService } from '../../../shared/services/validation.service';
import { ProgramsRestService } from '../../services/programs-rest.service';
import { QuestionsRestService } from '../../services/questions-rest.service';
import { QuestionFormComponent } from '../create-questions/question-form.component';

interface IUserStatsDisplay {
  user: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  score?: number;
  team: {
    id: string;
    name: string;
  };
  answeredQuestionsCount: number;
  completedAt?: string;
  lastLaunchedAt?: string;
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
  ETab = ETab;
  EPlaceholderStatus = EPlaceholderStatus;
  ELoadingStatus = ELoadingStatus;

  company!: Company;
  program?: Program;
  isAccelerated = false;

  tabsOptions: ITabOption[] = [
    { value: ETab.Informations, label: I18ns.programs.forms.step1.title },
    { value: ETab.Questions, label: I18ns.programs.forms.step2.title },
    { value: ETab.Summary, label: I18ns.programs.forms.step3.title },
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

  // Summary and results tab
  programStat?: ProgramStatsDtoApi;
  userStatsPageControl = new FormControl(1, { nonNullable: true });
  userStatsPageSize = 5;
  userStatsDisplay: IUserStatsDisplay[] = [];
  userStatsTotalCount = 0;

  usersStatsTeamsControl = new FormControl([] as FormControl<SelectOption>[], {
    nonNullable: true,
  });

  userStatsSearchControl = new FormControl<string | null>(null);
  userStatsDataStatus = EPlaceholderStatus.LOADING;
  launchProgramButtonStatus = ELoadingStatus.DEFAULT;

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
    private readonly router: Router,
    private readonly scoreRestService: ScoresRestService,
    private readonly triggersService: TriggersService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    const tags = (data[EResolvers.LeadResolver] as ILeadData).tags;
    this.company = (data[EResolvers.AppResolver] as IAppData).company;
    const editProgramData = data[EResolvers.EditProgramResolver] as IEditProgramData;
    this.program = editProgramData.program;
    this.isAccelerated = editProgramData.isAccelerated;

    this.tabsControl.setValue(
      this.tabsOptions.find((tab) => tab.value === editProgramData.tab) ?? this.tabsOptions[0],
    );

    this.editProgramComponentSubscription.add(
      this.tabsControl.valueChanges.pipe(startWith(this.tabsControl.value)).subscribe((tab) => {
        this.location.replaceState(
          this.router
            .createUrlTree([], {
              relativeTo: this.activatedRoute,
              queryParams: { tab: tab.value },
            })
            .toString(),
        );
      }),
    );

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

    this.editProgramComponentSubscription.add(
      this.tabsControl.valueChanges
        .pipe(
          startWith(this.tabsControl.value),
          filter(({ value }) => {
            return value === this.tabsOptions[2].value;
          }),
          switchMap(() => {
            return this.scoreRestService.getPaginatedProgramsStats(EScoreDuration.Year, false, {
              ids: this.program?.id,
            });
          }),
          switchMap(({ data: programStats = [] }) => {
            return combineLatest([
              this.usersStatsTeamsControl.valueChanges.pipe(
                startWith(this.usersStatsTeamsControl.value),
                tap(() => this.userStatsPageControl.patchValue(1)),
              ),
              concat(
                of(this.userStatsSearchControl.value),
                this.userStatsSearchControl.valueChanges.pipe(
                  debounceTime(200),
                  tap(() => this.userStatsPageControl.patchValue(1)),
                ),
              ),
              this.userStatsPageControl.valueChanges.pipe(startWith(this.userStatsPageControl.value)),
              of(programStats),
            ]);
          }),
          filter(([, , , programStats]) => {
            if (programStats.length === 0) {
              this.userStatsDataStatus = EPlaceholderStatus.NO_DATA;
              return false;
            }
            return true;
          }),
        )
        .subscribe(([teamsFilter, search, page, programStats]) => {
          this.programStat = programStats[0];

          if (programStats.length > 0) {
            let teams = programStats[0].teams;

            if (teamsFilter.length > 0) {
              teams = teams.filter((t) => teamsFilter.map((team) => team.value.value).includes(t.team.id));
            }

            if (search) {
              const regex = new RegExp(search, 'i');
              teams = teams.map((team) => {
                return {
                  ...team,
                  users: team.users.filter((u) => {
                    return (
                      regex.test(u.user.firstname) || regex.test(u.user.lastname) || regex.test(u.user.email)
                    );
                  }),
                };
              });
            }

            this.userStatsDisplay = teams
              .map((team) => {
                return team.users.map((u) => {
                  return {
                    user: {
                      firstname: u.user.firstname,
                      lastname: u.user.lastname,
                      email: u.user.email,
                      id: u.user.id,
                    },
                    score: u.score !== null ? u.score : undefined,
                    team: {
                      id: team.team.id,
                      name: team.team.name,
                    },
                    answeredQuestionsCount: u.answeredQuestionsCount,
                    completedAt: u.completedAt ? format(u.completedAt, 'dd/MM/yyyy') : undefined,
                    lastLaunchedAt: u.lastLaunchedAt ? format(u.lastLaunchedAt, 'dd/MM/yyyy') : undefined,
                  };
                });
              })
              .flat()
              .sort((a, b) => b.answeredQuestionsCount - a.answeredQuestionsCount)
              .slice((page - 1) * this.userStatsPageSize, page * this.userStatsPageSize);

            this.userStatsDataStatus =
              this.userStatsDisplay.length === 0
                ? search || teamsFilter.length > 0
                  ? EPlaceholderStatus.NO_RESULT
                  : EPlaceholderStatus.NO_DATA
                : EPlaceholderStatus.GOOD;
            this.userStatsTotalCount = teams.reduce((acc, team) => acc + team.users.length, 0);
          }
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
      isAccelerated: this.program ? undefined : this.isAccelerated,
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

  resetFilters(): void {
    this.usersStatsTeamsControl.patchValue([]);
    this.userStatsSearchControl.patchValue(null);
  }

  launchAcceleratedProgram(): void {
    if (this.program && this.launchProgramButtonStatus === ELoadingStatus.DEFAULT) {
      const hasAlreadyStarted = (this.program as Program).hasAlreadyStarted;

      const launchSubscription = this.questionsRestService
        .getProgramQuestionsCount(this.program.id)
        .pipe(
          filter((count) => {
            if (count === 0) {
              const cannotLaunchModal = this.modalService.open(ConfirmModalComponent, {
                centered: true,
                size: 'md',
              });
              const componentInstance = cannotLaunchModal.componentInstance as ConfirmModalComponent;
              componentInstance.data = {
                title: I18ns.programs.forms.step3.members.cannotLaunchTitle,
                subtitle: I18ns.programs.forms.step3.members.cannotLaunch,
                confirmText: I18ns.shared.confirm,
                icon: 'bi-send',
              };

              launchSubscription.unsubscribe();
              return false;
            }
            return true;
          }),
          switchMap(() => {
            this.launchProgramButtonStatus = ELoadingStatus.LOADING;

            const modalRef = this.modalService.open(ConfirmModalComponent, { centered: true, size: 'md' });
            const componentInstance = modalRef.componentInstance as ConfirmModalComponent;
            componentInstance.data = {
              title: hasAlreadyStarted
                ? I18ns.programs.forms.step3.members.reminderDescriptionTitle
                : I18ns.programs.forms.step3.members.launchDescriptionTitle,
              subtitle: hasAlreadyStarted
                ? I18ns.programs.forms.step3.members.reminderDescription
                : I18ns.programs.forms.step3.members.launchDescription,
              confirmText: hasAlreadyStarted
                ? I18ns.programs.forms.step3.members.sendReminder
                : I18ns.shared.confirm,
              cancelText: I18ns.shared.cancel,
              icon: 'bi-send',
            };

            return modalRef.closed;
          }),
          filter((confirmed) => {
            if (!confirmed) {
              launchSubscription.unsubscribe();
              this.launchProgramButtonStatus = ELoadingStatus.DEFAULT;
              return false;
            }
            return confirmed;
          }),
          switchMap(() => {
            return this.triggersService.launchAcceleratedProgram({
              acceleratedProgramId: (this.program as Program).id,
              companyId: this.company.id,
            });
          }),
          switchMap(() => {
            this.store.dispatch(launchAcceleratedProgram({ programId: this.program?.id as string }));
            return this.store.select(FromRoot.selectCompany);
          }),
          tap(({ data: company }) => {
            this.program = company.programById.get(this.program?.id as string) as Program;
          }),
          first(),
        )
        .subscribe({
          next: () => {
            this.tabsControl.patchValue(this.tabsOptions[2]);
          },
          error: () => {
            this.toastService.show({
              type: 'danger',
              text: hasAlreadyStarted
                ? I18ns.programs.forms.step3.members.reminderErrorToast
                : I18ns.programs.forms.step3.members.launchErrorToast,
            });

            setTimeout(() => {
              this.launchProgramButtonStatus = ELoadingStatus.ERROR;
              setTimeout(() => {
                this.launchProgramButtonStatus = ELoadingStatus.DEFAULT;
              }, 3000);
            }, 500); // animation delay
          },
          complete: () => {
            setTimeout(() => {
              this.launchProgramButtonStatus = ELoadingStatus.SUCCESS;
              setTimeout(() => {
                this.launchProgramButtonStatus = ELoadingStatus.DEFAULT;
              }, 3000);
            }, 500); // animation delay
            this.toastService.show({
              type: 'success',
              text: hasAlreadyStarted
                ? I18ns.programs.forms.step3.members.reminderToast
                : I18ns.programs.forms.step3.members.launchSuccess,
            });
          },
        });
    }
  }

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
