import { AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';
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

export class ChartBarComponent implements OnInit, OnChanges, AfterViewInit{
  @Input() chartOption?: EChartsOption
  barOptions?: EChartsOption
  @Input() isLoaded = true;
  constructor(private chartsService: ChartsService ) { }  
  
  ngOnInit(): void {
    if (this.chartOption && this.isLoaded) {
      this.barOptions = this.chartsService.altoFormattingBar(this.chartOption)
    }
  }

  ngOnChanges(): void {
    if (this.chartOption && this.isLoaded) {
      this.barOptions = this.chartsService.altoFormattingBar(this.chartOption)
    }
  }

  ngAfterViewInit(): void {
    this.isLoaded = true;
  }
}
