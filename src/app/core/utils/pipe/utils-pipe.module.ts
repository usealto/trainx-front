import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Uuid2colorPipe } from './uuid2color.pipe';
import { PillColorPipe } from './pill-color.pipe';
import { SliceWithDotsPipe } from './slice-with-dots.pipe';
import { SortPipe } from './sort.pipe';
import { DateLabelPipe } from './date-label.pipe';

@NgModule({
  declarations: [Uuid2colorPipe, PillColorPipe, SliceWithDotsPipe, SortPipe, DateLabelPipe],
  imports: [CommonModule],
  exports: [Uuid2colorPipe, PillColorPipe, SliceWithDotsPipe, SortPipe, DateLabelPipe],
})
export class UtilsPipeModule {}
