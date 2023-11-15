import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { ChartBasiclineComponent } from './chart-basicline/chart-basicline.component';
import { ChartBarComponent } from './chart-bar/chart-bar.component';
import { ChartRadarComponent } from './chart-radar/chart-radar.component';

@NgModule({
  declarations: [ChartBasiclineComponent, ChartBarComponent, ChartRadarComponent],
  imports: [
    CommonModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
  exports: [ChartBasiclineComponent, ChartBarComponent, ChartRadarComponent],
})
export class ChartsModule {}
