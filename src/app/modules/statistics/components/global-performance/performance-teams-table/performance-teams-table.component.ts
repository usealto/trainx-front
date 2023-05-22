import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { TeamsStatsFilters } from 'src/app/modules/shared/models/stats.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { StatsDtoApi, TeamStatsDtoApi } from '@usealto/sdk-ts-angular';

@UntilDestroy()
@Component({
  selector: 'alto-performance-teams-table',
  templateUrl: './performance-teams-table.component.html',
  styleUrls: ['./performance-teams-table.component.scss'],
})
export class PerformanceTeamsTableComponent implements OnInit {
  I18ns = I18ns;

  @Input() duration: ScoreDuration = ScoreDuration.Year;

  teamFilters: TeamsStatsFilters = {
    programs: [],
    tags: [],
    teams: [],
    search: '',
  };

  teams: TeamStatsDtoApi[] = [];
  teamsDisplay: TeamStatsDtoApi[] = [];
  paginatedTeams: TeamStatsDtoApi[] = [];
  teamsPage = 1;
  teamsPageSize = 10;
  programs: StatsDtoApi[] = [];
  tags: StatsDtoApi[] = [];

  constructor(
    public readonly teamStore: TeamStore,
    public readonly profileStore: ProfileStore,
    public readonly programsStore: ProgramsStore,
    private readonly scoreRestService: ScoresRestService,
  ) {}

  ngOnInit(): void {
    this.scoreRestService
      .getTeamsStats(this.duration as ScoreDuration)
      .pipe(
        tap((t) => {
          this.teams = t;
          this.teamsDisplay = t;
          this.programs = t.map((te) => te.programs || []).flat();
          this.tags = t.map((te) => te.tags || []).flat();
          this.changeTeamsPage(1);
        }),
        tap(console.log),
        untilDestroyed(this),
      )
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['duration']?.currentValue) {
      this.getTeamsByDuration();
    }
  }

  getTeamsFiltered(
    {
      duration = this.teamFilters.duration,
      programs = this.teamFilters.programs,
      tags = this.teamFilters.tags,
      teams = this.teamFilters.teams,
      search = this.teamFilters.search,
    }: TeamsStatsFilters = this.teamFilters,
  ) {
    this.teamFilters.duration = duration;
    this.teamFilters.programs = programs;
    this.teamFilters.tags = tags;
    this.teamFilters.teams = teams;
    this.teamFilters.search = search;

    // this.teamsDisplay = this.teams.

    this.changeTeamsPage(1);
  }

  getTeamsByDuration() {
    this.scoreRestService
      .getTeamsStats(this.duration as ScoreDuration)
      .pipe(
        tap((t) => {
          this.teams = t;
          this.teamsDisplay = t;
          this.programs = t.map((te) => te.programs || []).flat();
          this.tags = t.map((te) => te.tags || []).flat();
          this.changeTeamsPage(1);
        }),
        tap(console.log),
        untilDestroyed(this),
      )
      .subscribe();
  }

  changeTeamsPage(page: number) {
    this.teamsPage = page;
    this.paginatedTeams = this.teamsDisplay.slice((page - 1) * this.teamsPageSize, page * this.teamsPageSize);
  }
}
