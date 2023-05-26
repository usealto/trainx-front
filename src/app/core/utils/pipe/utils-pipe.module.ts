import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Uuid2colorPipe } from './uuid2color.pipe';
import { PillColorPipe } from './pill-color.pipe';
import { SliceWithDotsPipe } from './slice-with-dots.pipe';
import { SortPipe } from './sort.pipe';

@NgModule({
  declarations: [Uuid2colorPipe, PillColorPipe, SliceWithDotsPipe, SortPipe],
  imports: [CommonModule],
  exports: [Uuid2colorPipe, PillColorPipe, SliceWithDotsPipe, SortPipe],
})
export class UtilsPipeModule {}
