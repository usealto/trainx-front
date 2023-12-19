import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule } from '../charts/charts.module';
import { UserHomeRoutingModule } from './user-home-routing.module';
import { UserHomeComponent } from './components/user-home/user-home.component';
import { SharedModule } from '../shared/shared.module';
import { UserHomeStatisticsComponent } from './components/statistics/user-home-statistics.component';

@NgModule({
  declarations: [UserHomeComponent, UserHomeStatisticsComponent],
  imports: [CommonModule, UserHomeRoutingModule, SharedModule, ChartsModule],
})
export class UserHomeModule {}
