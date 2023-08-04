import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { ChartBasiclineComponent } from './chart-basicline/chart-basicline.component';


@NgModule({
  declarations: [ChartBasiclineComponent],
  imports: [
    CommonModule,
    NgxEchartsModule.forChild(),
  ],
  exports: [
    ChartBasiclineComponent
  ]
})
export class ChartsModule { }
