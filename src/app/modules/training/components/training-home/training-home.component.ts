import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
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
type AllProgramsFilters = { score?: ScoreFilter | string; search?: string };

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
  user = this.userStore.user.value;

  constructor(
    private readonly programRunsRestService: ProgramRunsRestService,
    private readonly scoresService: ScoresService,
    private readonly userStore: ProfileStore,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.programRunsRestService
      .getMyProgramRunsCards()
      .pipe(
        tap((a) => {
          this.allPrograms = this.allProgramsFiltered = a;
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
    let { score, search } = filters;

    search ??= this.allProgramsFilters.search;
    if (score === null) {
      // When he value is unselected from the dropdown
      score = undefined;
    } else {
      score ||= this.allProgramsFilters.score;
    }

    this.allProgramsFilters = { search, score };

    let output: TrainingCardData[] = this.allPrograms ?? [];
    if (score) {
      output = this.scoresService.filterByScore(
        output.filter((p) => !p.isProgress),
        score as ScoreFilter,
        false,
      );
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

  @memoize()
  getUser(id: string): UserDtoApi | undefined {
    return this.userStore.users.value.find((x) => x.id === id);
  }
}
