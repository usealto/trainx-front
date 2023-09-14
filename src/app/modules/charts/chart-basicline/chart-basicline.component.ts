import { AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';
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
      useFactory: () => ({ echarts: () => import('echarts') }),
    },
  ],
})
export class ChartBasiclineComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() chartOption?: EChartsOption;
  lineOptions?: EChartsOption;
  @Input() isLoaded = true;
  constructor(private chartsService: ChartsService) {}

  ngOnInit(): void {
    if (this.chartOption && this.isLoaded) {
      this.lineOptions = this.chartsService.altoFormattingMultiline(this.chartOption);
    }
  }

  ngOnChanges(): void {
    if (this.chartOption && this.isLoaded) {
      this.lineOptions = this.chartsService.altoFormattingMultiline(this.chartOption);
    }
  }

  ngAfterViewInit(): void {
    this.isLoaded = true;
  }
}
