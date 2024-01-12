import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProgramDtoApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProgramFilters } from 'src/app/modules/programs/models/program.model';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ProgramsService } from 'src/app/modules/programs/services/programs.service';
import { ScoreDuration, ScoreFilter } from 'src/app/modules/shared/models/score.model';
import { AltoRoutes } from '../../constants/routes';
import { PlaceholderDataStatus } from '../../models/placeholder.model';
import { ScoresRestService } from '../../services/scores-rest.service';
import { ScoresService } from '../../services/scores.service';
import { FormControl } from '@angular/forms';

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
  pageControl = new FormControl(1, { nonNullable: true });
  count = 0;
  pageSize = 3;

  programFilters: ProgramFilters = { teams: [], search: '' };

  displayToggle = false;
  isSearchResult = false;
  selectedItems: ProgramDtoApi[] = [];
  ongoingProgramsDataStatus: PlaceholderDataStatus = 'loading';

  constructor(
    private readonly scoreService: ScoresService,
    private readonly programService: ProgramsService,
    public readonly teamStore: TeamStore,
    public readonly programStore: ProgramsStore,
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
    if (this.count === 0 && this.isSearchResult === true) {
      this.ongoingProgramsDataStatus = 'noResult';
    }
  }

  resetFilters() {
    this.filterPrograms((this.programFilters = {}));
    this.selectedItems = [];
    this.isSearchResult = false;
    this.ongoingProgramsDataStatus = 'good';
  }

  getPrograms() {
    const data$ =
      this.programStore.programsInitCardList.value?.length > 0
        ? this.programStore.programsInitCardList.value$
        : this.scoresRestService
            .getProgramsStats(ScoreDuration.All, false, {
              sortBy: 'updatedAt:desc',
            })
            .pipe(tap((stats) => (this.programStore.programsInitCardList.value = stats)));

    data$
      .pipe(
        tap((data) => {
          // If the place is 'active', filter out programs that are not active and that has no team
          if (this.isActive) {
            data = data?.filter((program) => program.program.isActive && program.teams.length !== 0) ?? [];
          }
          data?.sort((a, b) => {
            if (a.program.isActive === b.program.isActive) {
              // If both programs have the same active state, sort by updatedAt
              return new Date(b.program.updatedAt).getTime() - new Date(a.program.updatedAt).getTime();
            }
            return a.program.isActive ? -1 : 1;
          });
          data.forEach((x) => {
            x.program.teams = x.teams.map((t) => t.team);
          });
          this.programs = data.map((x) => x.program);
          this.programsDisplay = this.programs;
          this.count = this.programs.length;
          this.ongoingProgramsDataStatus = this.count === 0 ? 'noData' : 'good';

          this.isSearchResult = false;
          data.forEach((x) => {
            this.programsScores.set(x.program.id, x.score ?? 0);
            this.programsProgress.set(x.program.id, x.progress ?? 0);
            this.programsInvolvement.set(x.program.id, x.participation ?? 0);
            this.programsMemberHaveValidatedCount.set(
              x.program.id,
              x.userValidatedProgramCount + '/' + x.totalUsersCount,
            );
          });

          setTimeout(() => {
            this.programTotal.emit(this.count);
          }, 0);
        }),
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
