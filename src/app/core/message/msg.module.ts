import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MsgComponent } from './msg/msg.component';

@NgModule({
  imports: [CommonModule],
  exports: [MsgComponent],
  declarations: [MsgComponent],
})
export class MsgModule {}
