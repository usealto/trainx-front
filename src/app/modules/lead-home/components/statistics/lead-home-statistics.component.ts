import { Component, Input } from '@angular/core';
import { LeadHomeStatistics } from './lead-home-statistics.model';

@Component({
  selector: 'alto-lead-home-statistics',
  templateUrl: './lead-home-statistics.component.html',
  styleUrls: ['./lead-home-statistics.component.scss'],
})
export class LeadHomeStatisticsComponent {
  @Input() data!: LeadHomeStatistics;
}
