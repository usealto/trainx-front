import { AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';

@Component({
  selector: 'alto-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrls: ['./chart-bar.component.scss'],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({ echarts: () => import('echarts') }),
    },
  ],
})
export class ChartBarComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() chartOption?: EChartsOption;
  @Input() isLoaded = true;

  barOptions?: EChartsOption;

  ngOnInit(): void {
    if (this.chartOption && this.isLoaded) {
      this.barOptions = this.chartOption;
    }
  }

  ngOnChanges(): void {
    if (this.chartOption && this.isLoaded) {
      this.barOptions = this.chartOption;
    }
  }

  ngAfterViewInit(): void {
    this.isLoaded = true;
  }
}
