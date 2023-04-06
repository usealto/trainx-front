import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { LeadHomeComponent } from './components/lead-home/lead-home.component';
import { LeadHomeRoutingModule } from './lead-home-routing.module';
import { LeadHomeStatisticsComponent } from './components/statistics/lead-home-statistics.component';
import { LeadHomeScoreGraphComponent } from './components/lead-home-score-graph/lead-home-score-graph.component';

@NgModule({
  declarations: [LeadHomeComponent, LeadHomeStatisticsComponent, LeadHomeScoreGraphComponent],
  imports: [CommonModule, LeadHomeRoutingModule, SharedModule],
})
export class LeadHomeModule {}
