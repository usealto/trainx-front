import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { EResolverData, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { User } from 'src/app/models/user.model';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ScoreFilter } from 'src/app/modules/shared/models/score.model';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { TrainingCardData } from '../../models/training.model';

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

type DoneFilters = { scoreStatus?: DoneFilter; search?: string };
type AllProgramsFilters = { progress?: ScoreFilter | string; score?: ScoreFilter | string; search?: string };

@UntilDestroy()
@Component({
  selector: 'alto-training-home',
  templateUrl: './training-home.component.html',
  styleUrls: ['./training-home.component.scss'],
})
export class TrainingHomeComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  OngoingFilter = OngoingFilter;
  DoneFilter = DoneFilter;
  activeTab = 1;

  guessesCount = 0;
  startedProgramsCount = 0;
  doneFilters: DoneFilters = { scoreStatus: DoneFilter.All, search: '' };
  allProgramsFilters: AllProgramsFilters = { search: '' };

  onGoingPrograms: TrainingCardData[] = [];
  onGoingProgramsDisplay?: TrainingCardData[];
  improveScorePrograms?: TrainingCardData[];
  doneProgramsFiltered?: TrainingCardData[];
  donePrograms?: TrainingCardData[];
  allPrograms?: TrainingCardData[];
  allProgramsFiltered?: TrainingCardData[];
  me!: User;
  users!: Map<string, User>;
  selectedItems: TrainingCardData[] = [];
  disabledCountScore?: number;
  disabledCountProgress?: number;

  constructor(
    private readonly programRunsRestService: ProgramRunsRestService,
    private readonly scoresService: ScoresService,
    private readonly router: Router,
    private readonly resolversService: ResolversService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.me = data[EResolverData.Me] as User;
    this.users = data[EResolverData.UsersById] as Map<string, User>;
    this.programRunsRestService
      .getMyProgramRunsCards()
      .pipe(
        tap((a) => {
          this.allPrograms = this.allProgramsFiltered = a;
          this.disabledCountScore = a.filter((r) => !r.isProgress).length;
          this.disabledCountProgress = a.filter((r) => r.isProgress).length;
          this.onGoingPrograms = this.onGoingProgramsDisplay = a.filter((r) => r.isProgress && r.duration);
          this.startedProgramsCount = this.onGoingPrograms.filter((p) => !!p.programRunId).length;
          this.improveScorePrograms = a.filter((r) => !r.isProgress && r.score < r.expectation);
          this.donePrograms = this.doneProgramsFiltered = a.filter((r) => !r.isProgress);
        }),
      )
      .subscribe();
  }

  switchTab(index: number) {
    this.activeTab = index;
  }

  onGoingFilter(val: OngoingFilter) {
    switch (val) {
      case OngoingFilter.All:
        this.onGoingProgramsDisplay = this.onGoingPrograms;
        break;
      case OngoingFilter.Started:
        this.onGoingProgramsDisplay = this.onGoingPrograms.filter((p) => !!p.programRunId);
        break;
      case OngoingFilter.New:
        this.onGoingProgramsDisplay = this.onGoingPrograms.filter((p) => !p.programRunId);
        break;
    }
  }

  doneFilter(val: DoneFilters) {
    let { search, scoreStatus } = val;

    search ||= this.doneFilters.search;
    scoreStatus ||= DoneFilter.All;

    this.doneFilters = { search, scoreStatus };

    switch (scoreStatus) {
      case DoneFilter.All:
        this.doneProgramsFiltered = this.donePrograms;
        break;
      case DoneFilter.Good:
        this.doneProgramsFiltered = this.donePrograms?.filter((p) => p.score > p.expectation);
        break;
      case DoneFilter.NotGood:
        this.doneProgramsFiltered = this.donePrograms?.filter((p) => p.score < p.expectation);
        break;
    }
    if (search) {
      this.doneProgramsFiltered = this.doneProgramsFiltered?.filter((p) => p.title.includes(search ?? ''));
    }
  }

  allProgramsFilter(filters: AllProgramsFilters) {
    let { score, progress, search } = filters;

    search ??= this.allProgramsFilters.search;
    if (score === null) {
      // When the value is unselected from the dropdown
      score = undefined;
    } else {
      score ||= this.allProgramsFilters.score;
    }
    if (progress === null) {
      progress = undefined;
    } else {
      progress ||= this.allProgramsFilters.progress;
    }

    this.allProgramsFilters = { score, progress, search };

    let output: TrainingCardData[] = this.allPrograms ?? [];

    const outputP = this.scoresService.filterByScore(
      output.filter((p) => p.isProgress),
      progress as ScoreFilter,
      false,
    );
    const outputS = this.scoresService.filterByScore(
      output.filter((p) => !p.isProgress),
      score as ScoreFilter,
      false,
    );

    if (score) {
      output = outputS;
    }
    if (progress) {
      output = outputP;
    }
    if (score && progress) {
      output = outputP.concat(outputS);
    }

    if (search) {
      output = output.filter((p) => p.title.includes(search ?? ''));
    }

    this.allProgramsFiltered = output;
  }

  backToTrainings() {
    this.router.navigate(['/', AltoRoutes.user, AltoRoutes.training]);
    this.switchTab(1);
  }

  resetFilters() {
    this.allProgramsFilter((this.allProgramsFilters = {}));
    this.selectedItems = [];
  }

  @memoize()
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }
}
