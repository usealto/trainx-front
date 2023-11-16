import { AfterViewInit, Component, Input, OnChanges } from '@angular/core';
import { EChartsOption } from 'echarts';
import { ChartsService } from '../charts.service';

@Component({
  selector: 'alto-chart-radar',
  templateUrl: './chart-radar.component.html',
  styleUrls: ['./chart-radar.component.scss'],
})
export class ChartRadarComponent implements OnChanges, AfterViewInit {
  @Input() chartOption?: EChartsOption;

  isLoaded = false;
  radarOption?: EChartsOption;

  constructor(private chartsService: ChartsService) {}

  ngOnChanges(): void {
    if (this.chartOption && this.isLoaded) {
      // this.radarOption = this.chartsService.altoFormattingRadar(this.chartOption);
      this.radarOption = this.chartOption;
    }
  }

  ngAfterViewInit(): void {
    this.isLoaded = true;
  }
}
