import { AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'alto-chart-bar',
  templateUrl: './chart-bar.component.html',
  styleUrls: ['./chart-bar.component.scss'],
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
