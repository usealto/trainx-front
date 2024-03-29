import { AfterViewInit, Component, Input, OnChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { ChartsService, initOptions } from '../charts.service';

@Component({
  selector: 'alto-chart-basicline',
  templateUrl: './chart-basicline.component.html',
  styleUrls: ['./chart-basicline.component.scss'],
})
export class ChartBasiclineComponent implements OnChanges, AfterViewInit {
  @Input() chartOption?: EChartsOption;
  @Input() tooltipTitleFormatter?: (title: string) => string;
  @Input() initOptions: initOptions = {};

  isLoaded = false;
  lineOptions?: EChartsOption;

  constructor(private chartsService: ChartsService) {}

  ngOnChanges(): void {
    if (this.chartOption && this.isLoaded) {
      this.lineOptions = this.chartsService.altoFormattingMultiline(
        this.chartOption,
        this.tooltipTitleFormatter,
      );
    }
  }

  ngAfterViewInit(): void {
    this.isLoaded = true;

    // ! For Storybook
    if (this.chartOption) {
      setTimeout(() => {
        if (this.chartOption) {
          this.lineOptions = this.chartsService.altoFormattingMultiline(
            this.chartOption,
            this.tooltipTitleFormatter,
          );
        }
      }, 1000);
    }
  }
}
