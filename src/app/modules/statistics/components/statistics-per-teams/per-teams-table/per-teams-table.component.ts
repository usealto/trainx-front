import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { DataForTable } from '../../../models/statistics.model';
import { Subscription, startWith } from 'rxjs';

@Component({
  selector: 'alto-per-teams-table',
  templateUrl: './per-teams-table.component.html',
  styleUrls: ['./per-teams-table.component.scss'],
})
export class PerTeamsTableComponent implements OnInit, OnChanges, OnDestroy {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  @Input() data: DataForTable[] = [];
  @Input() type!: 'team' | 'user';

  pageSize = 5;
  pageControl = new FormControl(1, { nonNullable: true });
  displayedData: DataForTable[] = [];

  private perTeamsTableComponentSubscription = new Subscription();

  ngOnInit(): void {
    this.perTeamsTableComponentSubscription.add(
      this.pageControl.valueChanges
        .pipe(startWith(this.pageControl.value))
        .subscribe((page) => this.paginate(page)),
    );
  }

  ngOnChanges(): void {
    this.paginate(this.pageControl.value);
  }

  ngOnDestroy(): void {
    this.perTeamsTableComponentSubscription.unsubscribe();
  }

  paginate(page: number) {
    this.displayedData = this.data.slice((page - 1) * this.pageSize, page * this.pageSize);
  }
}
