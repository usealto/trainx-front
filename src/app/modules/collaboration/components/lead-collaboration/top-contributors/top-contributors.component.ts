import { Component, OnInit } from '@angular/core';
import { UserStatsDtoApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';

@Component({
  selector: 'alto-top-contributors',
  templateUrl: './top-contributors.component.html',
  styleUrls: ['./top-contributors.component.scss'],
})
export class TopContributorsComponent implements OnInit {
  I18ns = I18ns;

  usersStats: UserStatsDtoApi[] | null = [];

  constructor(private readonly scoreRestService: ScoresRestService) {}

  ngOnInit(): void {
    this.scoreRestService
      .getUsersStats(ScoreDuration.Month, false, undefined, 'contributions:desc')
      .pipe(
        tap((u) => {
          this.usersStats = u.filter((stat) => stat.contributions > 0).slice(0, 5);
          this.usersStats = (this.usersStats?.length || 0) > 0 ? this.usersStats : null;
        }),
      )
      .subscribe();
  }
}
