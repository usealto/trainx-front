import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { ChartBasiclineComponent } from './chart-basicline/chart-basicline.component';
import { ChartBarComponent } from './chart-bar/chart-bar.component';

@NgModule({
  declarations: [ChartBasiclineComponent, ChartBarComponent],
  imports: [
    CommonModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
  exports: [ChartBasiclineComponent, ChartBarComponent],
})
export class ChartsModule {}
