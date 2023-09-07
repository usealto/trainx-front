import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProgramDtoApi, TagDtoApi, TeamDtoApi, TeamStatsDtoApi } from '@usealto/sdk-ts-angular';
import { switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { TeamsStatsFilters } from 'src/app/modules/shared/models/stats.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';

@UntilDestroy()
@Component({
  selector: 'alto-performance-teams-table',
  templateUrl: './performance-teams-table.component.html',
  styleUrls: ['./performance-teams-table.component.scss'],
})
export class PerformanceTeamsTableComponent implements OnInit, OnChanges {
  I18ns = I18ns;

  @Input() duration: ScoreDuration = ScoreDuration.Year;

  teamFilters: TeamsStatsFilters = {
    programs: [],
    tags: [],
    teams: [],
    search: '',
  };

  teams: TeamStatsDtoApi[] = [];
  teamsPreviousPeriod: TeamStatsDtoApi[] = [];
  teamsDisplay: TeamStatsDtoApi[] = [];
  paginatedTeams: TeamStatsDtoApi[] = [];
  teamsPage = 1;
  teamsPageSize = 5;

  programs: ProgramDtoApi[] = [];
  tags: TagDtoApi[] = [];
  scoreIsLoading = false;

  constructor(
    public readonly teamStore: TeamStore,
    public readonly profileStore: ProfileStore,
    public readonly programsStore: ProgramsStore,
    public readonly programsRestService: ProgramsRestService,
    private readonly scoreRestService: ScoresRestService,
  ) {}

  ngOnInit(): void {
    this.programsRestService
      .getPrograms()
      .pipe(tap((pgs) => (this.programs = pgs)))
      .subscribe();
    this.tags = this.programsStore.tags.value;

    this.getTeamsByDuration();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['duration']?.firstChange && changes['duration']?.currentValue) {
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
    // this.teamFilters.teams = teams;
    this.teamFilters.search = search;

    let output: TeamStatsDtoApi[] = this.teams;
    if (programs && programs.length > 0) {
      output = output.filter((t) => t.programs?.some((p) => programs.some((pr) => pr === p.id)));
    }
    if (tags && tags.length > 0) {
      output = output.filter((t) => t.tags?.some((p) => tags.some((pr) => pr === p.id)));
    }

    if (search) {
      output = output.filter((t) => t.team.longName.toLowerCase().includes(search.toLowerCase()));
    }
    // if (teams && teams.length > 0) {
    //   output = output.filter((t) => teams.some((pr) => pr === t.id));
    // }

    this.teamsDisplay = output;

    this.changeTeamsPage(1);
  }

  getTeamsByDuration() {
    this.scoreIsLoading = true;
    this.scoreRestService
      .getTeamsStats(this.duration as ScoreDuration)
      .pipe(
        tap((t) => {
          this.teams = t;
          this.teamsDisplay = t;

          this.changeTeamsPage(1);
        }),
        switchMap(() => this.scoreRestService.getTeamsStats(this.duration, true)),
        tap((t) => (this.teamsPreviousPeriod = t)),
        tap(() => (this.scoreIsLoading = false)),
        tap(() => this.getTeamsFiltered()),
        untilDestroyed(this),
      )
      .subscribe();
  }

  changeTeamsPage(page: number) {
    this.teamsPage = page;
    this.paginatedTeams = this.teamsDisplay.slice((page - 1) * this.teamsPageSize, page * this.teamsPageSize);
  }

  @memoize()
  getTeamPreviousScore(team: TeamStatsDtoApi) {
    const prevScore = this.teamsPreviousPeriod.filter((t) => t.id === team.id)[0]?.score || 0;
    return prevScore && team.score ? team.score - prevScore : 0;
  }

  // @memoize()
  // getTeamsDropdown(size: number): TeamDtoApi[] {
  //   return this.teamsDisplay.map((t) => t.team);
  // }
}
