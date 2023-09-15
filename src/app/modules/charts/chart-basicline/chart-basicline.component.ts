import { AfterViewInit, Component, Input, OnChanges } from '@angular/core';
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
export class ChartBasiclineComponent implements OnChanges, AfterViewInit {
  @Input() chartOption?: EChartsOption;

  isLoaded = false;
  lineOptions?: EChartsOption;

  constructor(private chartsService: ChartsService) {}

  ngOnChanges(): void {
    if (this.chartOption && this.isLoaded) {
      this.lineOptions = this.chartsService.altoFormattingMultiline(this.chartOption);
    }
  }

  ngAfterViewInit(): void {
    this.isLoaded = true;

    // ! For Storybook
    if (this.chartOption) {
      setTimeout(() => {
        if (this.chartOption) {
          this.lineOptions = this.chartsService.altoFormattingMultiline(this.chartOption);
        }
      }, 1000);
    }
  }
}
