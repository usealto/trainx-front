import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TeamDtoApi, TeamStatsDtoApi } from '@usealto/sdk-ts-angular';
import { combineLatest, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { DataForTable } from 'src/app/modules/statistics/models/statistics.model';
import { PlaceholderDataStatus } from '../../../models/placeholder.model';
import { ScoreDuration } from '../../../models/score.model';
import { ScoresRestService } from '../../../services/scores-rest.service';
import { ScoresService } from '../../../services/scores.service';

@Component({
  selector: 'alto-team-engagement-table',
  templateUrl: './team-engagement-table.component.html',
  styleUrls: ['./team-engagement-table.component.scss'],
})
export class TeamEngagementTableComponent implements OnInit, OnChanges {
  EmojiName = EmojiName;
  I18ns = I18ns;

  @Input() duration: ScoreDuration = ScoreDuration.Year;

  teams: TeamDtoApi[] = [];
  teamsDisplay: DataForTable[] = [];
  paginatedTeams: DataForTable[] = [];
  teamsPage = 1;
  teamsPageSize = 5;
  teamsDataStatus: PlaceholderDataStatus = 'good';

  constructor(
    private readonly scoreRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
  ) {}

  ngOnInit(): void {
    this.getDatas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['duration']) {
      this.getDatas();
    }
  }

  getDatas() {
    combineLatest([
      this.scoreRestService.getTeamsStats(this.duration),
      this.scoreRestService.getTeamsStats(this.duration, true),
    ])
      .pipe(
        tap(([teams, teamsProg]) => {
          this.teams = teams.map((t) => t.team);

          this.teamsDisplay = teams.map((t) => {
            const teamProg = teamsProg.find((tp) => tp.team.id === t.team.id);
            return this.dataForTeamTableMapper(t, teamProg);
          });
          this.teamsDataStatus = teams.length === 0 ? 'noData' : 'good';
        }),
        tap(() => this.changeTeamsPage(1)),
      )
      .subscribe();
  }

  dataForTeamTableMapper(t: TeamStatsDtoApi, tProg?: TeamStatsDtoApi) {
    return {
      team: t.team,
      globalScore: t.score,
      answeredQuestionsCount: t.totalGuessesCount,
      answeredQuestionsProgression: this.scoresService.getProgression(
        t.totalGuessesCount,
        tProg?.totalGuessesCount,
      ),
      commentsCount: t.commentsCount,
      commentsProgression: this.scoresService.getProgression(t.commentsCount, tProg?.commentsCount),
      submittedQuestionsCount: t.questionsSubmittedCount,
      submittedQuestionsProgression: this.scoresService.getProgression(
        t.questionsSubmittedCount,
        tProg?.questionsSubmittedCount,
      ),
      leastMasteredTags: t.tags
        ?.filter((ta) => (ta.score ?? 0) < 50)
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .slice(0, 3)
        .map((t) => t.tag.name),
    } as DataForTable;
  }

  changeTeamsPage(page: number) {
    this.teamsPage = page;
    this.paginatedTeams = this.teamsDisplay.slice((page - 1) * this.teamsPageSize, page * this.teamsPageSize);
  }
}
