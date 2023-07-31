import { Component } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';

@Component({
  selector: 'alto-chart-basicline',
  templateUrl: './chart-basicline.component.html',
  styleUrls: ['./chart-basicline.component.scss'],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts: () => import('echarts') })
    },
  ],
})
export class ChartBasiclineComponent {
  chartOption?: EChartsOption;
  chartDefaultOption: EChartsOption = {
    tooltip: {
      trigger: 'axis',
    },
    toolbox: {
      feature: {
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ['line'] },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    legend: {
      data: ['Votre Score'],
    },
    xAxis: [
      {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
        color: '#09479e',
        data: [20, 23, 45, 56, 13, 47, 60],
        tooltip: {
          valueFormatter: (value) => {
            return (value as number) + ' %';
          },
        },
      },
    ]

  };

  constructor() { 
    this.chartOption = {
      ...this.chartDefaultOption,
    }

  }

}
