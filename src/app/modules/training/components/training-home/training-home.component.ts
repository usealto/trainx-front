import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, combineLatest, concat, debounceTime, of, startWith, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { User } from 'src/app/models/user.model';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { ITabOption } from 'src/app/modules/shared/components/tabs/tabs.component';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { PillOption, SelectOption } from 'src/app/modules/shared/models/select-option.model';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../core/resolvers';
import { Program } from '../../../../models/program.model';
import { EScoreFilter, Score } from '../../../../models/score.model';
import { ITrainingCardData } from '../../../shared/components/training-card/training-card.component';
import { EPlaceholderStatus } from '../../../shared/components/placeholder-manager/placeholder-manager.component';

enum EtrainingTabs {
  Ongoing = 'Ongoing',
  Done = 'Done',
  ShowAll = 'ShowAll',
}

enum OngoingFilter {
  All = 'All',
  Started = 'Started',
  New = 'New',
}

enum DoneFilter {
  All = 'All',
  Good = 'Good',
  NotGood = 'NotGood',
}

@Component({
  selector: 'alto-training-home',
  templateUrl: './training-home.component.html',
  styleUrls: ['./training-home.component.scss'],
})
export class TrainingHomeComponent implements OnInit, OnDestroy {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  EtrainingTabs = EtrainingTabs;

  me!: User;
  usersById!: Map<string, User>;
  programsById!: Map<string, Program>;
  allTrainingCards: ITrainingCardData[] = [];

  tabOptions: ITabOption[] = [
    {
      label: I18ns.training.tabs.onGoing,
      value: EtrainingTabs.Ongoing,
    },
    {
      label: I18ns.training.tabs.done,
      value: EtrainingTabs.Done,
    },
    {
      label: I18ns.training.tabs.showAll,
      value: EtrainingTabs.ShowAll,
    },
  ];
  tabControl = new FormControl<ITabOption>(this.tabOptions[0], { nonNullable: true });

  // ONGOING TAB
  // ongoing section
  ongoingTrainingCards: ITrainingCardData[] = [];
  ongoingFilterOptions: SelectOption[] = [
    new SelectOption({
      label: I18ns.training.onGoing.filters.showAll,
      value: OngoingFilter.All,
    }),
    new SelectOption({
      label: I18ns.training.onGoing.filters.started,
      value: OngoingFilter.Started,
    }),
    new SelectOption({
      label: I18ns.training.onGoing.filters.new,
      value: OngoingFilter.New,
    }),
  ];
  ongoingFilterControl = new FormControl<SelectOption>(this.ongoingFilterOptions[0], { nonNullable: true });
  ongoingPageControl = new FormControl<number>(1, { nonNullable: true });
  readonly ongoingPageSize = 3;
  ongoingTotalItems = 0;
  ongoingDataStatus = EPlaceholderStatus.LOADING;

  // toImprove section
  toImproveTrainingCards: ITrainingCardData[] = [];
  toImprovePageControl = new FormControl<number>(1, { nonNullable: true });
  readonly toImprovePageSize = 3;
  toImproveTotalItems = 0;
  toImproveDataStatus = EPlaceholderStatus.LOADING;

  // FINISHED TAB
  finishedTrainingCards: ITrainingCardData[] = [];
  finishedPageControl = new FormControl<number>(1, { nonNullable: true });
  finishedProgramsSearchControl = new FormControl<string | null>(null);
  finishedTotalItems = 0;
  finishedFilterOptions: SelectOption[] = [
    new SelectOption({ label: I18ns.training.donePrograms.filters.showAll, value: DoneFilter.All }),
    new SelectOption({ label: I18ns.training.donePrograms.filters.good, value: DoneFilter.Good }),
    new SelectOption({ label: I18ns.training.donePrograms.filters.notGood, value: DoneFilter.NotGood }),
  ];
  finishedFilterControl = new FormControl<SelectOption>(this.finishedFilterOptions[0], {
    nonNullable: true,
  });
  readonly finishedPageSize = 3;
  finishedDataStatus = EPlaceholderStatus.LOADING;

  // SEE ALL TAB
  allProgramsSearchControl = new FormControl<string | null>(null);
  allProgramsPageControl = new FormControl<number>(1, { nonNullable: true });

  readonly scoreOptions: PillOption[] = Score.getFiltersPillOptions();
  allProgramsScoreControl = new FormControl<PillOption | null>(null);
  allProgramsProgressControl = new FormControl<PillOption | null>(null);
  allProgramsTrainingCards: ITrainingCardData[] = [];
  allProgramsTotalItems = 0;
  readonly allProgramsPageSize = 9;
  allProgramsDataStatus = EPlaceholderStatus.LOADING;

  private readonly trainingHomeComponentSubscription = new Subscription();

  constructor(
    private readonly programRunsRestService: ProgramRunsRestService,
    private readonly scoresService: ScoresService,
    private readonly router: Router,
    private readonly resolversService: ResolversService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.me = (data[EResolvers.AppResolver] as IAppData).me;
    this.usersById = (data[EResolvers.AppResolver] as IAppData).userById;
    this.programsById = (data[EResolvers.AppResolver] as IAppData).company.programById;

    this.programRunsRestService
      .getAllProgramRuns({ createdBy: this.me.id })
      .pipe(
        tap((programRuns) => {
          this.allTrainingCards = programRuns
            .filter((programRun) => this.programsById.has(programRun.programId))
            .map((programRun) => {
              const program = this.programsById.get(programRun.programId) as Program;
              return {
                title: program.name,
                score: (programRun.goodGuessesCount / programRun.questionsCount) * 100,
                updatedAt: programRun.updatedAt,
                programRunId: programRun.id,
                programId: programRun.programId,
                expectation: program.expectation ?? 0,
                inProgress: !programRun.finishedAt,
                duration: programRun.questionsCount * 30,
              };
            });
        }),
      )
      .subscribe({
        complete: () => {
          // add ongoing subscription
          this.trainingHomeComponentSubscription.add(
            combineLatest([
              this.ongoingFilterControl.valueChanges.pipe(
                startWith(this.ongoingFilterControl.value),
                tap(() => this.ongoingPageControl.patchValue(1)),
              ),
              this.ongoingPageControl.valueChanges.pipe(startWith(this.ongoingPageControl.value)),
            ])
              .pipe(tap(() => (this.ongoingDataStatus = EPlaceholderStatus.LOADING)))
              .subscribe({
                next: ([filter, page]) => {
                  let filteredCards = this.allTrainingCards.filter(
                    (card) => card.inProgress && card.duration,
                  );

                  switch (filter.value) {
                    case OngoingFilter.All:
                      break;
                    case OngoingFilter.New:
                      filteredCards = filteredCards.filter((card) => !card.programRunId);
                      break;
                    case OngoingFilter.Started:
                      filteredCards = filteredCards.filter((card) => card.programRunId);
                      break;
                  }

                  this.ongoingTotalItems = filteredCards.length;
                  this.ongoingTrainingCards = filteredCards.slice(
                    (page - 1) * this.ongoingPageSize,
                    page * this.ongoingPageSize,
                  );

                  this.ongoingDataStatus = this.ongoingTrainingCards.length
                    ? EPlaceholderStatus.GOOD
                    : EPlaceholderStatus.NO_DATA;
                },
              }),
          );

          // add toImprove subscription
          this.trainingHomeComponentSubscription.add(
            this.toImprovePageControl.valueChanges
              .pipe(startWith(this.toImprovePageControl.value))
              .subscribe({
                next: (page) => {
                  const filteredCards = this.allTrainingCards.filter(
                    (card) => !card.inProgress && card.score < card.expectation,
                  );

                  this.toImproveTotalItems = filteredCards.length;
                  this.toImproveTrainingCards = filteredCards.slice(
                    (page - 1) * this.toImprovePageSize,
                    page * this.toImprovePageSize,
                  );

                  this.toImproveDataStatus = this.toImproveTrainingCards.length
                    ? EPlaceholderStatus.GOOD
                    : EPlaceholderStatus.NO_DATA;
                },
              }),
          );

          // add finished subscription
          this.trainingHomeComponentSubscription.add(
            combineLatest([
              this.finishedFilterControl.valueChanges.pipe(startWith(this.finishedFilterControl.value)),
              concat(
                of(this.finishedProgramsSearchControl.value),
                this.finishedProgramsSearchControl.valueChanges.pipe(
                  debounceTime(200),
                  tap(() => this.finishedPageControl.setValue(1)),
                ),
              ),
              this.finishedPageControl.valueChanges.pipe(startWith(this.finishedPageControl.value)),
            ]).subscribe({
              next: ([filter, search, page]) => {
                let filteredCards = this.allTrainingCards.filter((card) => !card.inProgress);

                switch (filter.value) {
                  case DoneFilter.All:
                    break;
                  case DoneFilter.Good:
                    filteredCards = filteredCards.filter((card) => card.score >= card.expectation);
                    break;
                  case DoneFilter.NotGood:
                    filteredCards = filteredCards.filter((card) => card.score < card.expectation);
                    break;
                }

                if (search) {
                  const regex = new RegExp(search, 'i');
                  filteredCards = filteredCards.filter((card) => regex.test(card.title));
                }

                this.finishedTotalItems = filteredCards.length;

                this.finishedTrainingCards = filteredCards.slice(
                  (page - 1) * this.finishedPageSize,
                  page * this.finishedPageSize,
                );

                this.finishedDataStatus = this.finishedTrainingCards.length
                  ? EPlaceholderStatus.GOOD
                  : search
                  ? EPlaceholderStatus.NO_RESULT
                  : EPlaceholderStatus.NO_DATA;
              },
            }),
          );
          // add seeAll subscription
          this.trainingHomeComponentSubscription.add(
            combineLatest([
              this.allProgramsScoreControl.valueChanges.pipe(startWith(this.allProgramsScoreControl.value)),
              this.allProgramsProgressControl.valueChanges.pipe(
                startWith(this.allProgramsProgressControl.value),
              ),
              concat(
                of(this.allProgramsSearchControl.value),
                this.allProgramsSearchControl.valueChanges.pipe(
                  debounceTime(200),
                  tap(() => this.allProgramsPageControl.setValue(1)),
                ),
              ),
              this.allProgramsPageControl.valueChanges.pipe(startWith(this.allProgramsPageControl.value)),
            ]).subscribe({
              next: ([score, progress, search, page]) => {
                let filteredCards = this.allTrainingCards;

                if (score) {
                  const scoreFilter = score.value as EScoreFilter;
                  switch (scoreFilter) {
                    case EScoreFilter.Under25:
                      filteredCards = filteredCards.filter((card) => card.score < 25);
                      break;
                    case EScoreFilter.Under50:
                      filteredCards = filteredCards.filter((card) => card.score < 50);
                      break;
                    case EScoreFilter.Under75:
                      filteredCards = filteredCards.filter((card) => card.score < 75);
                      break;
                    case EScoreFilter.Over25:
                      filteredCards = filteredCards.filter((card) => card.score >= 25);
                      break;
                    case EScoreFilter.Over50:
                      filteredCards = filteredCards.filter((card) => card.score >= 50);
                      break;
                    case EScoreFilter.Over75:
                      filteredCards = filteredCards.filter((card) => card.score >= 75);
                      break;
                  }
                }

                if (progress) {
                  const progressFilter = progress.value as EScoreFilter;
                  switch (progressFilter) {
                    case EScoreFilter.Under25:
                      filteredCards = filteredCards.filter((card) => card.score < 25);
                      break;
                    case EScoreFilter.Under50:
                      filteredCards = filteredCards.filter((card) => card.score < 50);
                      break;
                    case EScoreFilter.Under75:
                      filteredCards = filteredCards.filter((card) => card.score < 75);
                      break;
                    case EScoreFilter.Over25:
                      filteredCards = filteredCards.filter((card) => card.score >= 25);
                      break;
                    case EScoreFilter.Over50:
                      filteredCards = filteredCards.filter((card) => card.score >= 50);
                      break;
                    case EScoreFilter.Over75:
                      filteredCards = filteredCards.filter((card) => card.score >= 75);
                      break;
                  }
                }

                if (search) {
                  const regex = new RegExp(search, 'i');
                  filteredCards = filteredCards.filter((card) => regex.test(card.title));
                }

                this.allProgramsTotalItems = filteredCards.length;

                this.allProgramsTrainingCards = filteredCards.slice(
                  (page - 1) * this.allProgramsPageSize,
                  page * this.allProgramsPageSize,
                );

                this.allProgramsDataStatus = filteredCards.length
                  ? EPlaceholderStatus.GOOD
                  : EPlaceholderStatus.NO_RESULT;
              },
            }),
          );
        },
      });

    this.trainingHomeComponentSubscription.add(
      this.tabControl.valueChanges.subscribe({
        next: () => {
          this.ongoingPageControl.patchValue(1);
          this.toImprovePageControl.patchValue(1);
          this.finishedPageControl.patchValue(1);
          this.allProgramsPageControl.patchValue(1);
        },
      }),
    );
  }

  ngOnDestroy(): void {
    this.trainingHomeComponentSubscription.unsubscribe();
  }

  switchTab(selectedOption: ITabOption): void {
    this.tabControl.patchValue(selectedOption);
  }

  backToTrainings() {
    this.router.navigate(['/', AltoRoutes.user, AltoRoutes.training]);
    this.tabControl.patchValue(this.tabOptions[0]);
  }

  resetFinishedFilters(): void {
    this.finishedProgramsSearchControl.patchValue(null);
  }

  resetAllProgramsFilters(): void {
    this.allProgramsScoreControl.patchValue(null);
    this.allProgramsProgressControl.patchValue(null);
    this.allProgramsSearchControl.patchValue(null);
  }
}
