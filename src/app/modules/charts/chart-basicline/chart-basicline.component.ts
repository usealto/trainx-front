import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { ChartsService } from '../charts.service';
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
export class ChartBasiclineComponent implements OnInit, OnChanges {
  @Input() chartOption?: EChartsOption
  lineOptions?: EChartsOption
  constructor(private chartsService: ChartsService) { }
  ngOnInit(): void {
    setTimeout(() => {
      if (this.chartOption) {
        this.lineOptions = this.chartsService.altoFormattingMultiline(this.chartOption)
      }
    }, 300);
  }

  ngOnChanges(): void {
    setTimeout(() => {
      if (this.chartOption) {
        this.lineOptions = this.chartsService.altoFormattingMultiline(this.chartOption)
      }
    }, 300);
  }
}
