import { Component, OnInit } from '@angular/core';
import { UserStatsDtoApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { EScoreDuration } from '../../../../../models/score.model';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';

@Component({
  selector: 'alto-top-contributors',
  templateUrl: './top-contributors.component.html',
  styleUrls: ['./top-contributors.component.scss'],
})
export class TopContributorsComponent implements OnInit {
  I18ns = I18ns;

  usersStats: UserStatsDtoApi[] | null = [];

  usersStatsDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  constructor(private readonly scoreRestService: ScoresRestService) {}

  ngOnInit(): void {
    this.scoreRestService
      .getPaginatedUsersStats(EScoreDuration.Month, false, { sortBy: 'contributions:desc' })
      .pipe(
        tap(({ data: rawUsersStats = [] }) => {
          this.usersStats = rawUsersStats.filter((stat) => stat.contributions > 0).slice(0, 5);
          this.usersStatsDataStatus =
            this.usersStats.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;
        }),
      )
      .subscribe();
  }
}
