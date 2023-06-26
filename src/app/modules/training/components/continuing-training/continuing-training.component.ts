import { Component, OnInit } from '@angular/core';
import { GuessDtoApi, UserLightDtoApi } from '@usealto/sdk-ts-angular';
import { addDays, format } from 'date-fns';
import { combineLatest, map, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { GuessesRestService } from '../../services/guesses-rest.service';

@Component({
  selector: 'alto-continuing-training',
  templateUrl: './continuing-training.component.html',
  styleUrls: ['./continuing-training.component.scss'],
})
export class ContinuingTrainingComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  daysInPeriod = 30;
  threshold = 0.42;
  //
  guessesCount = 0;
  avgScore = 0;
  previousAvgScore = 0;
  regularity = 0;
  previousRegularity = 0;
  streak = 0;
  longestStreak = 0;

  continuousSessionUsers: UserLightDtoApi[] = [];

  constructor(
    private readonly scoresRestService: ScoresRestService,
    private readonly guessesRestService: GuessesRestService,
    private readonly guessRestService: GuessesRestService,
    private readonly profileStore: ProfileStore,
  ) {}
  ngOnInit(): void {
    combineLatest([
      this.scoresRestService.getUsersStats(ScoreDuration.Month, false, this.profileStore.user.value.id),
      this.scoresRestService.getUsersStats(ScoreDuration.Month, true, this.profileStore.user.value.id),
      this.guessRestService.getGuesses(
        { createdBy: this.profileStore.user.value.id, itemsPerPage: 500 },
        ScoreDuration.Trimester,
      ),
      this.guessRestService.getGuesses(
        { createdBy: this.profileStore.user.value.id, itemsPerPage: 500 },
        ScoreDuration.Trimester,
        true,
      ),
    ])
      .pipe(
        tap(([userScore, previousSCore, guesses, previousGuesses]) => {
          this.regularity = this.getParticipationDays(guesses.data) / (this.daysInPeriod * this.threshold);
          this.previousRegularity =
            this.getParticipationDays(previousGuesses.data) / (this.daysInPeriod * this.threshold);

          this.avgScore = userScore.find((u) => u.id === this.profileStore.user.value.id)?.score ?? 0;
          this.previousAvgScore =
            previousSCore.find((u) => u.id === this.profileStore.user.value.id)?.score ?? 0;

          this.streak = this.profileStore.user.value.currentStreak.count;
          this.longestStreak = this.profileStore.user.value.longestStreak.count;
        }),
      )
      .subscribe();

    this.continuousSessionGetGuessesCount();
  }

  continuousSessionGetGuessesCount() {
    this.guessesRestService
      .getGuesses({
        createdAfter: addDays(new Date(), -1),
        createdBefore: addDays(new Date(), 1),
      })
      .pipe(
        map((gs) => gs.data?.filter((g) => !g.programRunId)),
        tap((guesses = []) => {
          const reducedGuesses = [] as GuessDtoApi[];
          guesses.forEach((guess) => {
            if (!reducedGuesses.some((g) => g.createdBy === guess.createdBy)) {
              reducedGuesses.push(guess);
            }
          });
          this.continuousSessionUsers = reducedGuesses.map((g) => g.createdByUser ?? '');
        }),
      )
      .subscribe();
  }

  private getParticipationDays(guesses: GuessDtoApi[] = []): number {
    return guesses.reduce((result, guess) => {
      const compare = format(guess.createdAt, 'MM/dd/yyyy');
      if (!result.find((x) => format(x.createdAt, 'MM/dd/yyyy') === compare)) {
        result.push(guess);
      }
      return result;
    }, [] as GuessDtoApi[]).length;
  }
}
