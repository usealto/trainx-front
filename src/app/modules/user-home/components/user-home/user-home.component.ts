import { Component, OnInit } from '@angular/core';
import { GuessDtoApi, ScoreTimeframeEnumApi, ScoreTypeEnumApi } from '@usealto/sdk-ts-angular';
import { getDayOfYear } from 'date-fns';
import { combineLatest, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ChartFilters } from 'src/app/modules/shared/models/chart.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';

@Component({
  selector: 'alto-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
})
export class UserHomeComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  userName = '';
  statisticsDuration = ScoreDuration.Month;

  guessesCount = 0;
  userScore = 0;
  userScoreProgression = 0;

  constructor(
    private readonly profileStore: ProfileStore,
    private readonly guessesRestService: GuessesRestService,
    private readonly scoresRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
  ) {}

  ngOnInit(): void {
    this.userName = this.profileStore.user.value.firstname ?? this.profileStore.user.value.username ?? '';
    this.getGuessesCount();
    this.getScore();
  }

  getGuessesCount() {
    this.guessesRestService
      .getGuesses()
      .pipe(
        tap((guesses) => {
          const date = new Date();
          const reducedGuesses = [] as GuessDtoApi[];
          guesses.forEach((guess) => {
            if (
              getDayOfYear(guess.createdAt) === getDayOfYear(date) &&
              !reducedGuesses.some((g) => g.createdBy === guess.createdBy)
            ) {
              reducedGuesses.push(guess);
              this.guessesCount++;
            }
          });
        }),
      )
      .subscribe();
  }

  getScore() {
    const params = {
      timeframe: ScoreTimeframeEnumApi.Day,
      duration: this.statisticsDuration,
      type: ScoreTypeEnumApi.User,
      ids: [this.profileStore.user.value.id],
    } as ChartFilters;
    combineLatest([this.scoresRestService.getScores(params), this.scoresRestService.getScores(params, true)])
      .pipe(
        tap(([curr, prev]) => {
          this.userScore = this.scoresService.reduceWithoutNull(curr.scores[0].averages) ?? 0;
          if (prev.scores.length) {
            this.userScoreProgression = this.scoresService.reduceWithoutNull(prev.scores[0].averages) ?? 0;
          }
        }),
      )
      .subscribe();
  }
}
