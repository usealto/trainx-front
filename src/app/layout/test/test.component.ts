import { Component } from '@angular/core';
import { ChallengeDtoApiStatusEnumApi } from '@usealto/sdk-ts-angular';
import { EChartsOption } from 'echarts';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'alto-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  isDev = !environment.production;
  ChallengeDtoApiStatusEnumApi = ChallengeDtoApiStatusEnumApi;

  pageSize = 5;

  chartOption: EChartsOption = {
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
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
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
    series: [
      {
        name: 'Votre Score',
        type: 'bar',
        color: '#09479e',
        data: [26, 59, 90, 26, 0, 70, 75, 82, 48, 18, 60, 23],
        tooltip: {
          valueFormatter: function (value) {
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
        data: [20, 82, 33, 45, 63, 100, 90, 0, 23, 65, 10, 62],
        tooltip: {
          valueFormatter: function (value) {
            return (value as number) + ' %';
          },
        },
      },
    ],
  };

  constructor(
    public readonly teamStore: TeamStore,
    public readonly userStore: ProfileStore,
    public readonly programStore: ProgramsStore,
    programRestService: ProgramsRestService,
    userRestService: UsersRestService,
  ) {
    programRestService.getPrograms().subscribe();
    userRestService.getUsers().subscribe();
  }
}
