import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ScoreDuration } from 'src/app/modules/programs/models/score.model';
import { ScoresRestService } from 'src/app/modules/programs/services/scores-rest.service';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import {
  GetScoresRequestParams,
  ScoreDtoApi,
  ScoreFillValuesEnumApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
  TeamDtoApi,
} from 'src/app/sdk';

@Component({
  selector: 'alto-statistics-global-performance',
  templateUrl: './statistics-global-performance.component.html',
  styleUrls: ['./statistics-global-performance.component.scss'],
})
export class StatisticsGlobalPerformanceComponent implements OnInit {
  I18ns = I18ns;
  teams: TeamDtoApi[] = [];
  scoredTeams: { label: string; score: number }[] = [];

  constructor(
    public readonly teamStore: TeamStore,
    private readonly teamsRestService: TeamsRestService,
    private readonly scoresRestService: ScoresRestService,
  ) {}

  ngOnInit(): void {
    this.teamsRestService.getTeams().subscribe();
    this.getTeamsScores();
  }

  getTeamsScores(duration?: ScoreDuration) {
    this.scoresRestService
      .getScores({
        timeframe: ScoreTimeframeEnumApi.Day,
        duration: duration ?? ScoreDuration.Year,
        type: ScoreTypeEnumApi.Team,
      } as ChartFilters)
      .pipe(
        tap((res) => {
          const temp = res.scores
            .map((score) => {
              const filledScore = score.averages.filter((average) => average !== null);
              const average = filledScore.reduce((acc, val) => acc + val, 0) / filledScore.length;
              return { label: score.label, score: average };
            })
            .sort((a, b) => b.score - a.score);
          temp.push(
            { label: 'test2', score: 0 },
            { label: 'test', score: -0.02 },
            { label: 'test3', score: -0.74 },
          );
          this.scoredTeams = temp;
        }),
      )
      .subscribe();
  }

  updateTimePicker(event: any): void {
    this.getTeamsScores(event.target.id);
  }
}
