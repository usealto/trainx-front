import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProgramDtoApi } from '@usealto/sdk-ts-angular';
import { map, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProgramFilters } from 'src/app/modules/programs/models/program.model';
import { ProgramsService } from 'src/app/modules/programs/services/programs.service';
import { ScoreDuration, ScoreFilter } from 'src/app/modules/shared/models/score.model';
import { AltoRoutes } from '../../constants/routes';
import { ScoresRestService } from '../../services/scores-rest.service';
import { ScoresService } from '../../services/scores.service';

@UntilDestroy()
@Component({
  selector: 'alto-program-card-list',
  templateUrl: './program-card-list.component.html',
  styleUrls: ['./program-card-list.component.scss'],
})
export class ProgramCardListComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  @Output() programTotal = new EventEmitter<number>();
  @Input() place: 'home' | 'program' = 'home';
  @Input() isActive = false;

  programs: ProgramDtoApi[] = [];
  programsDisplay: ProgramDtoApi[] = [];

  programsScores = new Map<string, number>();
  programsProgress = new Map<string, number>();
  programsInvolvement = new Map<string, number>();
  programsMemberHaveValidatedCount = new Map<string, string>();
  page = 1;
  count = 0;
  pageSize = 3;

  programFilters: ProgramFilters = { teams: [], search: '' };

  displayToggle = false;
  isSearchResult = false;
  selectedItems: ProgramDtoApi[] = [];

  constructor(
    private readonly scoreService: ScoresService,
    private readonly programService: ProgramsService,
    public readonly teamStore: TeamStore,
    private readonly scoresRestService: ScoresRestService,
  ) {}

  ngOnInit(): void {
    if (this.place === 'home' || this.isActive) {
      this.displayToggle = false;
    } else if (this.place === 'program') {
      this.displayToggle = true;
    }
    this.getPrograms();
    this.setPageSize();
  }

  filterPrograms({
    teams = this.programFilters.teams,
    search = this.programFilters.search,
    score = this.programFilters.score,
    progress = this.programFilters.progress,
  }: ProgramFilters) {
    let filteredData;

    this.programFilters.search = search;
    this.programFilters.teams = teams;
    this.programFilters.score = score;
    this.programFilters.progress = progress;

    const filters = {
      teams: this.programFilters.teams,
      search: this.programFilters.search,
    };

    this.programsDisplay = this.programService.filterPrograms(this.programs, filters);
    filteredData = this.programsDisplay.map((p) => {
      return {
        ...p,
        score: this.programsScores.get(p.id),
      };
    });
    //filter by score
    if (this.programFilters.score) {
      filteredData = this.scoreService.filterByScore(
        filteredData,
        this.programFilters.score as ScoreFilter,
        true,
      );
    }

    //filter by progress
    if (this.programFilters.progress) {
      filteredData.map((p) => {
        p.score = this.programsProgress.get(p.id);
        return p;
      });
      filteredData = this.scoreService.filterByScore(
        filteredData,
        this.programFilters.progress as ScoreFilter,
        true,
      );
    }
    this.programsDisplay = filteredData.map((p) => {
      return { ...p, score: undefined };
    });
    this.count = this.programsDisplay.length;
    this.isSearchResult = true;
  }

  resetFilters() {
    this.filterPrograms((this.programFilters = {}));
    this.selectedItems = [];
    this.isSearchResult = false;
  }

  getPrograms() {
    this.scoresRestService
      .getProgramsStats(ScoreDuration.All, false, {
        sortBy: 'updatedAt:desc',
      })
      .pipe(
        map((data) => {
          // If the place is 'active', filter out programs that are not active and that has no team
          if (this.isActive) {
            data = data?.filter((program) => program.program.isActive && program.teams.length !== 0) ?? [];
          }
          return data?.sort((a, b) => {
            if (a.program.isActive === b.program.isActive) {
              // If both programs have the same active state, sort by updatedAt
              return new Date(b.program.updatedAt).getTime() - new Date(a.program.updatedAt).getTime();
            }
            return a.program.isActive ? -1 : 1;
          });
        }),
        tap((p) => {
          p.map((x) => {
            x.program.teams = x.teams.map((t) => t.team);
          });
          this.programs = p.map((x) => x.program);
          this.programsDisplay = this.programs;
          this.count = this.programs.length;
          this.isSearchResult = false;
          p.forEach((x) => {
            this.programsScores.set(x.program.id, x.score ?? 0);
            this.programsProgress.set(x.program.id, x.progress ?? 0);
            this.programsInvolvement.set(x.program.id, x.participation ?? 0);
            this.programsMemberHaveValidatedCount.set(
              x.program.id,
              x.userValidatedProgramCount + '/' + x.totalUsersCount,
            );
          });
          this.programTotal.emit(p.map((x) => x.program).length);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  setPageSize() {
    const cardsByLine = 3;
    if (this.place === 'home' || this.isActive) {
      this.pageSize = cardsByLine;
    } else if (this.place === 'program') {
      this.pageSize = cardsByLine * 3;
    }
  }
}
