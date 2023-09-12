import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { ChartsService } from './../charts.service';

@Component({
  selector: 'alto-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrls: ['./chart-bar.component.scss'],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts: () => import('echarts') })
    },
  ],
})

export class ChartBarComponent implements OnInit, OnChanges{
  @Input() chartOption?: EChartsOption
  barOptions?: EChartsOption
  constructor(private chartsService: ChartsService ) { }  
  ngOnInit(): void {
    setTimeout(() => {
      if (this.chartOption) {
        this.barOptions = this.chartsService.altoFormattingBar(this.chartOption)
      }
    }, 300);
  }

  ngOnChanges(): void {
    setTimeout(() => {
      if (this.chartOption) {
        this.barOptions = this.chartsService.altoFormattingBar(this.chartOption)
      }
    }, 300);
  }
}
