import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Observable, combineLatest, map, of, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { User } from 'src/app/models/user.model';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ScoreFilter } from 'src/app/modules/shared/models/score.model';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../core/resolvers';
import { GetProgramRunsRequestParams, ProgramRunDtoPaginatedResponseApi } from '@usealto/sdk-ts-angular';
import { Program } from '../../../../models/program.model';
import { ITrainingCardData } from '../../../shared/components/training-card/training-card.component';

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

  programs: Program[] = [];

  onGoingPrograms: ITrainingCardData[] = [];
  onGoingProgramsDisplay?: ITrainingCardData[];
  improveScorePrograms?: ITrainingCardData[];
  doneProgramsFiltered?: ITrainingCardData[];
  donePrograms?: ITrainingCardData[];
  allPrograms?: ITrainingCardData[];
  allProgramsFiltered?: ITrainingCardData[];
  me!: User;
  users!: Map<string, User>;
  selectedItems: ITrainingCardData[] = [];
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
    this.me = (data[EResolvers.AppResolver] as IAppData).me;
    this.users = (data[EResolvers.AppResolver] as IAppData).userById;
    this.programs = (data[EResolvers.AppResolver] as IAppData).company.programs;
    this.getMyProgramRunsCards(this.me.id)
      .pipe(
        tap((a) => {
          this.allPrograms = this.allProgramsFiltered = a;
          this.disabledCountScore = a.filter((r) => !r.inProgress).length;
          this.disabledCountProgress = a.filter((r) => r.inProgress).length;
          this.onGoingPrograms = this.onGoingProgramsDisplay = a.filter((r) => r.inProgress && r.duration);
          this.startedProgramsCount = this.onGoingPrograms.filter((p) => !!p.programRunId).length;
          this.improveScorePrograms = a.filter((r) => !r.inProgress && r.score < r.expectation);
          this.donePrograms = this.doneProgramsFiltered = a.filter((r) => !r.inProgress);
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

    let output: ITrainingCardData[] = this.allPrograms ?? [];

    const outputP = this.scoresService.filterByScore(
      output.filter((p) => p.inProgress),
      progress as ScoreFilter,
      false,
    );
    const outputS = this.scoresService.filterByScore(
      output.filter((p) => !p.inProgress),
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

  getMyProgramRunsCards(userId: string): Observable<ITrainingCardData[]> {
    let myPrograms: ITrainingCardData[] = [];
    return this.programRunsRestService
      .getProgramRunsPaginated({
        createdBy: userId,
      } as GetProgramRunsRequestParams)
      .pipe(
        map((programRuns: ProgramRunDtoPaginatedResponseApi) => {
          return this.programs.reduce((output, p) => {
            const progRun = programRuns.data?.filter((x) => x.programId === p.id)[0] || null;

            output.push({
              title: p.name,
              score: !progRun ? 0 : (progRun.goodGuessesCount / progRun.questionsCount) * 100,
              updatedAt: progRun?.updatedAt,
              programRunId: progRun?.id,
              programId: p.id,
              expectation: p.expectation,
              inProgress: !progRun?.finishedAt,
              duration: (progRun?.questionsCount ? progRun?.questionsCount : p.questionsCount) * 30,
            });
            return output;
          }, [] as ITrainingCardData[]);
        }),
        tap((arr) => {
          myPrograms = arr.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0));
        }),
        switchMap((arr) =>
          combineLatest([
            this.programRunsRestService.getProgramRunsPaginated({
              isFinished: true,
              programIds: arr.map((x) => x.programId).join(','),
            }),
            of(this.users),
          ]),
        ),
        map(([prs, users]) => {
          myPrograms = myPrograms.map((pDisp) => ({
            ...pDisp,
            users:
              prs.data?.reduce((result, pr) => {
                const user = users.get(pr.createdBy ?? '');
                if (pr.programId === pDisp.programId && user && !result.find((u) => u.id === user.id)) {
                  result.push(user);
                }
                return result;
              }, [] as User[]) ?? [],
          }));
          return myPrograms;
        }),
      );
  }
}
