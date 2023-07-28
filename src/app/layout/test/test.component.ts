import { Component } from '@angular/core';
import {
  ChallengeDtoApiStatusEnumApi,
  ScoreDtoApi,
  ScoreTimeframeEnumApi,
  ScoreTypeEnumApi,
} from '@usealto/sdk-ts-angular';
import { EChartsOption } from 'echarts';
import { combineLatest, tap } from 'rxjs';
import { ToastService } from 'src/app/core/toast/toast.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { StatisticsService } from 'src/app/modules/statistics/services/statistics.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'alto-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent {
  EmojiName = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  isDev = !environment.production;
  ChallengeDtoApiStatusEnumApi = ChallengeDtoApiStatusEnumApi;

  pageSize = 5;

  // Chart
  statisticsDuration = ScoreDuration.Trimester;
  chartOption?: EChartsOption;
  chartDefaultOption: EChartsOption = {
    tooltip: {
      trigger: 'axis',
    },
    toolbox: {
      feature: {
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ['line', 'bar'] },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    legend: {
      data: ['Votre Score', 'Score Global'],
    },
    xAxis: [
      {
        type: 'category',
        axisPointer: {
          type: 'shadow',
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Score',
        min: 0,
        max: 100,
        interval: 10,
        axisLabel: {
          formatter: '{value}',
        },
      },
    ],
  };

  constructor(
    public readonly teamStore: TeamStore,
    public readonly userStore: ProfileStore,
    public readonly programStore: ProgramsStore,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly statisticsService: StatisticsService,
    programRestService: ProgramsRestService,
    userRestService: UsersRestService,
    private readonly toastService: ToastService,
  ) {
    programRestService.getPrograms().subscribe();
    userRestService.getUsers().subscribe();
    this.createUserProgressionChart();

    this.toastService.show({
      text: 'Le collaborateur [nom du collaborateur] a bien été modifié',
      type: 'success',
    });
  }

  createUserProgressionChart() {
    const params = {
      timeframe: ScoreTimeframeEnumApi.Day,
      duration: this.statisticsDuration,
    } as ChartFilters;

    combineLatest([
      this.scoresRestService.getScores({ ...params, type: ScoreTypeEnumApi.User }),
      this.scoresRestService.getScores({ ...params, type: ScoreTypeEnumApi.Team }),
    ])
      .pipe(
        tap(([usersScores, teamsScores]) => {
          //USER SCORES: reduce scores to remove all first values without data
          const rawUserScores = usersScores.scores.find((u) => u.id === this.userStore.user.value.id);
          const reducedUserScores = this.scoresService.reduceChartData([
            rawUserScores ?? ({} as ScoreDtoApi),
          ]);

          const userScores = this.statisticsService.aggregateDataForScores(
            reducedUserScores[0],
            this.statisticsDuration,
          );

          //TEAM SCORES: reduce scores to remove all first values without data
          const rawTeamScores = teamsScores.scores.find((t) => t.id === this.userStore.user.value.teamId);
          const reducedTeamScores = this.scoresService.reduceChartData([
            rawTeamScores ?? ({} as ScoreDtoApi),
          ]);

          const teamScores = this.statisticsService.aggregateDataForScores(
            reducedTeamScores[0],
            this.statisticsDuration,
          );

          const labels = this.statisticsService.formatLabel(
            userScores.map((d) => d.x),
            this.statisticsDuration,
          );

          this.chartOption = {
            ...this.chartDefaultOption,
            series: [
              {
                name: 'Votre Score',
                type: 'bar',
                color: '#09479e',
                data: userScores.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y ?? 0)),
                tooltip: {
                  valueFormatter: (value) => {
                    return (value as number) + ' %';
                  },
                },
              },
              {
                name: 'Score Global',
                type: 'line',
                lineStyle: {
                  width: 3,
                },
                color: '#FDB022',
                data: teamScores.map((d) => (d.y ? Math.round((d.y * 10000) / 100) : d.y ?? 0)),
                tooltip: {
                  valueFormatter: (value) => {
                    return (value as number) + ' %';
                  },
                },
              },
            ],
          };
          if (Array.isArray(this.chartOption.xAxis) && this.chartOption.xAxis[0]) {
            this.chartOption.xAxis[0] = { ...this.chartOption.xAxis[0], data: labels } as any;
          }
        }),
      )
      .subscribe();
  }

  updateTimePicker(duration: any) {
    this.statisticsDuration = duration;
    this.createUserProgressionChart();
  }
}
