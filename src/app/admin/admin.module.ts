import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminHomeComponent } from './components/admin-home/admin-home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [AdminHomeComponent],
  imports: [CommonModule, AdminRoutingModule, FormsModule, ReactiveFormsModule],
})
export class AdminModule {}
