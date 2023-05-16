import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Uuid2colorPipe } from './uuid2color.pipe';
import { PillColorPipe } from './pill-color.pipe';
import { ProgressionPillPipe } from './progression-pill.pipe';
import { ProgressionPillArrowPipe } from './progression-pill-arrow.pipe';
import { DefaultOrderKeyvaluePipe } from './default-order-keyvalue.pipe';

@NgModule({
  declarations: [Uuid2colorPipe, PillColorPipe, ProgressionPillPipe, ProgressionPillArrowPipe, DefaultOrderKeyvaluePipe],
  imports: [CommonModule],
  exports: [Uuid2colorPipe, PillColorPipe, ProgressionPillPipe, ProgressionPillArrowPipe, DefaultOrderKeyvaluePipe],
})
export class UtilsPipeModule {}
