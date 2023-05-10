import { Component, HostListener, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, of, switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProgramFilters } from 'src/app/modules/programs/models/program.model';
import { ScoreDuration } from 'src/app/modules/programs/models/score.model';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { ProgramsService } from 'src/app/modules/programs/services/programs.service';
import { ScoresRestService } from 'src/app/modules/programs/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/programs/services/scores.service';
import { ProgramDtoApi, ScoreTypeEnumApi } from 'src/app/sdk';
import { AltoRoutes } from '../../constants/routes';
import { memoize } from 'src/app/core/utils/memoize/memoize';

@UntilDestroy()
@Component({
  selector: 'alto-program-card-list',
  templateUrl: './program-card-list.component.html',
  styleUrls: ['./program-card-list.component.scss'],
})
export class ProgramCardListComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  @Input() place: 'home' | 'program' = 'home';

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setPageSize(event.target?.innerWidth);
  }

  programs: ProgramDtoApi[] = [];
  programsDisplay: ProgramDtoApi[] = [];

  programsScores = new Map<string, number>();
  programsProgress = new Map<string, number>();
  page = 1;
  count = 0;
  pageSize = 3;
  width = 0;

  programFilters: ProgramFilters = { teams: [], search: '' };

  displayToggle = false;
  displayEdit = false;

  constructor(
    private readonly programRunsService: ProgramRunsRestService,
    private readonly scoreService: ScoresService,
    private readonly programService: ProgramsService,
    public readonly teamStore: TeamStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly programRestService: ProgramsRestService,
  ) {}

  ngOnInit(): void {
    if (this.place === 'home') {
      this.displayToggle = false;
      this.displayEdit = false;
    } else if (this.place === 'program') {
      this.displayToggle = true;
      this.displayEdit = true;
    }
    this.getPrograms();
    this.setPageSize(window.innerWidth);
  }

  loadScores() {
    const index = this.page * this.pageSize;
    of(this.programs.slice(index, index + this.pageSize))
      .pipe(
        switchMap((p) =>
          combineLatest([
            this.scoresRestService.getScores({
              ids: p?.map((x) => x.id).filter((x) => !this.programsScores.has(x)),
              duration: ScoreDuration.Year,
              type: ScoreTypeEnumApi.Program,
            }),
            this.programRunsService.getProgramRunsPaginated({
              programIds: p
                ?.map((i) => i.id)
                .filter((x) => !this.programsProgress.has(x))
                .join(','),
            }),
          ]),
        ),
        tap(([{ scores }, { data }]) => {
          scores.forEach((x) => {
            this.programsScores.set(x.id, this.scoreService.reduceWithoutNull(x.averages));
          });
          // Temp map to retrieve progId as key and answered VS total questions
          const tmp = new Map<string, number[][]>();
          data?.forEach((pr) => {
            tmp.set(pr.programId, [...(tmp.get(pr.programId) ?? []), [pr.guessesCount, pr.questionsCount]]);
          });

          tmp.forEach((val, id) => {
            const prog = val.reduce((a, b) => [a[0] + b[0], a[1] + b[1]]);
            this.programsProgress.set(id, prog[0] / prog[1]);
          });
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  filterPrograms({ teams = this.programFilters.teams, search = this.programFilters.search }: ProgramFilters) {
    this.programFilters.search = search;
    this.programFilters.teams = teams;

    this.programsDisplay = this.programService.filterPrograms(this.programs, this.programFilters);
    this.count = this.programsDisplay.length;
    this.loadScores();
  }

  getPrograms() {
    this.programRestService
      .getProgramsPaginated({
        isActive: true,
        sortBy: 'updatedAt:desc',
      })
      .pipe(
        tap((p) => (this.programs = p.data ?? [])),
        tap((p) => (this.programsDisplay = p.data ?? [])),
        tap((p) => (this.count = p.meta.totalItems ?? [])),
        tap(() => this.loadScores()),
        untilDestroyed(this),
      )
      .subscribe();
  }

  setPageSize(width: number) {
    this.width = width;
    const cardsByLine = width < 1600 ? 3 : width < 1900 ? 4 : 5;
    if (this.place === 'home') {
      this.pageSize = cardsByLine;
    } else if (this.place === 'program') {
      this.pageSize = cardsByLine * 3;
    }
  }

  @memoize()
  getCardWidth(width: number) {
    return width < 1600 ? 'w-33' : width < 1900 ? 'w-25' : 'w-20';
  }
}
