import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Uuid2colorPipe } from './uuid2color.pipe';
import { PillColorPipe } from './pill-color.pipe';
import { ProgressionPillPipe } from './progression-pill.pipe';
import { ProgressionPillArrowPipe } from './progression-pill-arrow.pipe';
import { SliceWithDotsPipe } from './slice-with-dots.pipe';

@NgModule({
  declarations: [
    Uuid2colorPipe,
    PillColorPipe,
    ProgressionPillPipe,
    ProgressionPillArrowPipe,
    SliceWithDotsPipe,
  ],
  imports: [CommonModule],
  exports: [Uuid2colorPipe, PillColorPipe, ProgressionPillPipe, ProgressionPillArrowPipe, SliceWithDotsPipe],
})
export class UtilsPipeModule {}
