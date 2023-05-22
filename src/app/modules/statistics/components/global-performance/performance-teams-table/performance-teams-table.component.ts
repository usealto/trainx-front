import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { TeamsStatsFilters } from 'src/app/modules/shared/models/stats.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { TeamStatsDtoApi } from '@usealto/sdk-ts-angular';

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
    duration: '',
    programs: [],
    tags: [],
    teams: [],
    search: '',
  };

  teams: TeamStatsDtoApi[] = [];
  paginatedTeams: TeamStatsDtoApi[] = [];
  teamsPage = 1;
  teamsPageSize = 10;

  constructor(
    public readonly teamStore: TeamStore,
    public readonly profileStore: ProfileStore,
    public readonly programsStore: ProgramsStore,
    private readonly scoreRestService: ScoresRestService,
  ) {}

  ngOnInit(): void {
    this.scoreRestService
      .getTeamsStats(this.duration)
      .pipe(
        tap((t) => {
          this.teams = t;
          this.changeTeamsPage(1);
        }),
        tap(console.log),
        untilDestroyed(this),
      )
      .subscribe();
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

    this.scoreRestService
      .getTeamsStats(duration as ScoreDuration)
      .pipe(
        tap((t) => {
          this.teams = t;
          this.paginatedTeams = this.teams.slice(
            (this.teamsPage - 1) * this.teamsPageSize,
            this.teamsPage * this.teamsPageSize,
          );
        }),
        tap(console.log),
        untilDestroyed(this),
      )
      .subscribe();
  }

  changeTeamsPage(page: number) {
    this.teamsPage = page;
    this.paginatedTeams = this.teams.slice((page - 1) * this.teamsPageSize, page * this.teamsPageSize);
  }
}
