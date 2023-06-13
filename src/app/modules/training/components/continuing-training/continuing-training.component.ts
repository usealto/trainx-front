import { Component, OnInit } from '@angular/core';
import { ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { combineLatest, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';

@Component({
  selector: 'alto-continuing-training',
  templateUrl: './continuing-training.component.html',
  styleUrls: ['./continuing-training.component.scss'],
})
export class ContinuingTrainingComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  guessesCount = 0;
  avgScore = 0;
  previousAvgScore = 0;

  constructor(
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
    private readonly profileStore: ProfileStore,
  ) {}
  ngOnInit(): void {
    combineLatest([
      this.scoresRestService.getScores({
        duration: ScoreDuration.Month,
        type: ScoreTypeEnumApi.User,
        timeframe: ScoreTimeframeEnumApi.Day,
        ids: [this.profileStore.user.value.id],
      }),
      this.scoresRestService.getScores(
        {
          duration: ScoreDuration.Month,
          type: ScoreTypeEnumApi.User,
          timeframe: ScoreTimeframeEnumApi.Day,
          ids: [this.profileStore.user.value.id],
        },
        true,
      ),
    ])
      .pipe(
        tap(([userScore, previousSCore]) => {
          this.avgScore = this.scoresService.reduceWithoutNull(userScore.scores[0]?.averages) ?? 0;
          this.previousAvgScore =
            this.scoresService.reduceWithoutNull(previousSCore.scores[0]?.averages) ?? 0;
        }),
      )
      .subscribe();
  }
}
