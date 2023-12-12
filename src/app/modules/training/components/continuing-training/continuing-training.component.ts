import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GuessDtoApi, UserLightDtoApi } from '@usealto/sdk-ts-angular';
import { addDays, format } from 'date-fns';
import { combineLatest, map, tap } from 'rxjs';
import { IAppData } from 'src/app/core/resolvers';
import { EResolverData, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { User } from 'src/app/models/user.model';
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
  avgScoreProgression = 0;
  regularity = 0;
  regularityProgression = 0;
  streak = 0;
  longestStreak = 0;
  me!: User;

  continuousSessionUsers: UserLightDtoApi[] = [];

  constructor(
    private readonly scoresRestService: ScoresRestService,
    private readonly guessesRestService: GuessesRestService,
    private readonly guessRestService: GuessesRestService,
    private readonly resolversService: ResolversService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.me = (data[EResolverData.AppData] as IAppData).me;

    combineLatest([
      this.scoresRestService.getUsersStats(ScoreDuration.Month, false, this.me.id),
      this.scoresRestService.getUsersStats(ScoreDuration.Month, true, this.me.id),
      this.guessRestService.getGuesses({ createdBy: this.me.id, itemsPerPage: 500 }, ScoreDuration.Trimester),
      this.guessRestService.getGuesses(
        { createdBy: this.me.id, itemsPerPage: 500 },
        ScoreDuration.Trimester,
        true,
      ),
    ])
      .pipe(
        tap(([userScore, previousSCore, guesses, previousGuesses]) => {
          this.regularity = this.getParticipationDays(guesses.data) / (this.daysInPeriod * this.threshold);
          const previousRegularity =
            this.getParticipationDays(previousGuesses.data) / (this.daysInPeriod * this.threshold);
          this.regularityProgression = this.regularity - previousRegularity;

          this.avgScore = userScore.find((u) => u.id === this.me.id)?.score ?? 0;
          const previousAvgScore = previousSCore.find((u) => u.id === this.me.id)?.score ?? 0;
          this.avgScoreProgression = this.avgScore - previousAvgScore;

          this.streak = this.me.currentStreak?.count;
          this.longestStreak = this.me.longestStreak?.count;
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
        map((gs) => gs.data?.filter((g) => (g.programRunIds?.length || 0) > 0)),
        tap((guesses = []) => {
          const reducedGuesses = [] as GuessDtoApi[];
          guesses.forEach((guess) => {
            if (!reducedGuesses.some((g) => g.author?.id === guess.author?.id)) {
              reducedGuesses.push(guess);
            }
          });
          this.continuousSessionUsers = reducedGuesses.reduce((users, guess) => {
            if (guess.author) {
              return [...users, guess.author];
            }
            return users;
          }, [] as UserLightDtoApi[]);
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
