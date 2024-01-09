import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProgramDtoApi, TagDtoApi, TeamStatsDtoApi } from '@usealto/sdk-ts-angular';
import { switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { TeamsStatsFilters } from 'src/app/modules/shared/models/stats.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { TeamStats } from '../../../../../models/team.model';
import { Program } from '../../../../../models/program.model';
import { Company } from '../../../../../models/company.model';

@UntilDestroy()
@Component({
  selector: 'alto-performance-teams-table',
  templateUrl: './performance-teams-table.component.html',
  styleUrls: ['./performance-teams-table.component.scss'],
})
export class PerformanceTeamsTableComponent implements OnInit, OnChanges {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  @Input() company: Company = {} as Company;
  @Input() duration: ScoreDuration = ScoreDuration.Year;

  teamsStats: TeamStats[] = [];
  teamsStatsPrev: TeamStats[] = [];

  teamFilters: TeamsStatsFilters = {
    programs: [],
    tags: [],
    teams: [],
    search: '',
  };

  teamsDisplay: TeamStats[] = [];
  paginatedTeamsStats: TeamStats[] = [];
  teamsDataStatus: PlaceholderDataStatus = 'loading';
  teamsPage = 1;
  teamsPageSize = 5;

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
    this.tags = this.programsStore.tags.value;

    this.teamsStats = this.company.getStatsByPeriod(this.duration, false);
    this.teamsStatsPrev = this.company.getStatsByPeriod(this.duration, true);

    this.getTeamsFiltered();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['duration']?.firstChange && changes['duration']?.currentValue) {
      this.getTeamsFiltered();
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

    let output: TeamStats[] = this.teamsStats;
    if (programs && programs.length > 0) {
      output = output.filter((t) => t.programStats?.some((p) => programs.some((pr) => pr === p.programId)));
    }
    if (tags && tags.length > 0) {
      output = output.filter((t) => t.tagStats?.some((p) => tags.some((pr) => pr === p.tagId)));
    }

    if (search) {
      output = output.filter(
        (t) => this.company.teamById.get(t.teamId)?.name.toLowerCase().includes(search.toLowerCase()) ?? true,
      );
    }

    this.teamsDisplay = output;

    this.changeTeamsPage(1);
  }

  changeTeamsPage(page: number) {
    this.teamsPage = page;
    this.paginatedTeamsStats = this.teamsDisplay.slice(
      (page - 1) * this.teamsPageSize,
      page * this.teamsPageSize,
    );
    this.teamsDataStatus = this.paginatedTeamsStats.length === 0 ? 'noData' : 'good';
  }

  @memoize()
  getTeamPreviousScore(team: TeamStats) {
    const prevScore = this.teamsStatsPrev.filter((t) => t.teamId === team.teamId)[0]?.score || 0;
    return prevScore && team.score ? team.score - prevScore : 0;
  }

  getLowestScorePrograms(teamId: string): any[] {
    // Récupérer les statistiques de l'équipe spécifiée.
    const teamStats = this.teamsStats.find((team) => team.teamId === teamId)?.programStats;

    // Récupérer les programmes de l'équipe.
    const teamPrograms = this.company.getTeamPrograms(teamId);

    if (!teamStats || !teamPrograms) {
      return [];
    }

    // Associer chaque programme avec son score en utilisant les IDs des programmes.
    const programsWithScores = teamPrograms.map((program) => {
      const programStat = teamStats.find((stat) => stat.programId === program.id);
      return {
        ...program,
        score: programStat ? programStat.score : null,
      };
    });

    // Filtrer les programmes qui n'ont pas de score.
    const programsWithValidScores = programsWithScores.filter((program) => program.score !== null);

    // Trier les programmes par score en ordre croissant.
    programsWithValidScores.sort((a, b) => (a.score || 0) - (b.score || 0));

    // Retourner les trois programmes avec les scores les plus bas.
    return programsWithValidScores.slice(0, 3);
  }
}
