import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { DataForTable } from '../../../models/statistics.model';

@Component({
  selector: 'alto-per-teams-table',
  templateUrl: './per-teams-table.component.html',
  styleUrls: ['./per-teams-table.component.scss'],
})
export class PerTeamsTableComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  @Input() data: DataForTable[] = [];
  @Input() type!: 'team' | 'user';

  pageSize = 5;
  pageControl = new FormControl(1, { nonNullable: true });
  displayedData: DataForTable[] = [];

  ngOnInit(): void {
    this.pageControl.valueChanges.subscribe((page) => this.paginate(page));
  }

  paginate(page: number) {
    this.displayedData = this.data.slice((page - 1) * this.pageSize, page * this.pageSize);
  }
}
