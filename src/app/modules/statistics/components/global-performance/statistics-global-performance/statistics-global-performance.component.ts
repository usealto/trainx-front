import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import * as FromRoot from '../../../../../core/store/store.reducer';
import { Company } from '../../../../../models/company.model';
import { tap } from 'rxjs';

@Component({
  selector: 'alto-statistics-global-performance',
  templateUrl: './statistics-global-performance.component.html',
  styleUrls: ['./statistics-global-performance.component.scss'],
})
export class StatisticsGlobalPerformanceComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;
  duration: ScoreDuration = ScoreDuration.Trimester;
  company: Company = {} as Company;

  constructor(private readonly store: Store<FromRoot.AppState>) {}
  ngOnInit(): void {
    this.store
      .select(FromRoot.selectCompany)
      .pipe(
        tap(({data: company}) => 
          this.company = company
          )
        )
        .subscribe();
  }

  updateTimePicker(event: any): void {
    this.duration = event;
  }
}
