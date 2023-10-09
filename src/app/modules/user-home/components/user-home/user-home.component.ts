import { Component, Input, OnInit } from '@angular/core';
import { GuessDtoApi, UserDtoApi, UserLightDtoApi, UserStatsDtoApi } from '@usealto/sdk-ts-angular';
import { addDays } from 'date-fns';
import { combineLatest, map, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { TrainingCardData } from 'src/app/modules/training/models/training.model';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';

interface LeaderboardUser {
  position: number;
  user?: UserDtoApi;
  score: number | undefined;
  progression: number;
}
@Component({
  selector: 'alto-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
})
export class UserHomeComponent implements OnInit {
  @Input() pageSize = 2;

  page = 1;

  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  userName = '';
  ScoreDuration = ScoreDuration;
  //programs-run data
  guessesCount = 0;
  myProgramRunsCards: TrainingCardData[] = [];
  //programs-run data
  continuousSessionUsers: UserLightDtoApi[] = [];

  //team data
  durationTabs = ScoreDuration.Week;
  leaderboardUsers: LeaderboardUser[] | undefined = undefined;

  constructor(
    private readonly profileStore: ProfileStore,
    private readonly userRestService: UsersRestService,
    private readonly guessesRestService: GuessesRestService,
    private readonly programRunsRestService: ProgramRunsRestService,
    private readonly scoreRestService: ScoresRestService,
  ) {}

  ngOnInit(): void {
    this.programRunsRestService
      .getMyProgramRunsCards()
      .pipe(tap((a) => (this.myProgramRunsCards = a.filter((r) => r.isProgress && r.duration))))
      .subscribe();

    this.userName = this.profileStore.user.value.firstname ?? '';
    this.continuousSessionGetGuessesCount();
    this.getLeaderboard();
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
            if (!reducedGuesses.some((g) => g.author === guess.author)) {
              reducedGuesses.push(guess);
            }
          });
          this.continuousSessionUsers = reducedGuesses.reduce((users, guess) => {
            if (guess.author) {
              users.push(guess.author);
            }
            return users;
          }, [] as UserLightDtoApi[]);
        }),
      )
      .subscribe();
  }

  paginateProgramRuns(page: number) {
    this.page = page;
  }

  leaderboardTabChanged(event: ScoreDuration) {
    this.durationTabs = event;
    this.getLeaderboard();
  }

  getLeaderboard() {
    combineLatest([
      this.scoreRestService.getUsersStats(this.durationTabs, false),
      this.userRestService.getUsers(),
      this.scoreRestService.getUsersStats(this.durationTabs, true),
    ])
      .pipe(
        map(
          ([usersStats, users, previousScoredUsers]) =>
            [
              usersStats.filter((user) => user.teamId === this.profileStore.user.value.teamId),
              users.filter((user) => user.teamId === this.profileStore.user.value.teamId),
              previousScoredUsers.filter((user) => user.teamId === this.profileStore.user.value.teamId),
            ] as [UserStatsDtoApi[], UserDtoApi[], UserStatsDtoApi[]],
        ),
        tap(([teamUsers, users, previousScoredUsers]) => {
          this.leaderboardUsers = teamUsers
            .map((scoredUser, index) => {
              const user = users.find((user) => user.id === scoredUser.id);
              const previousScoredUser = previousScoredUsers.find((user) => user.id === scoredUser.id);
              const progression =
                previousScoredUser && previousScoredUser.score && scoredUser.score
                  ? scoredUser.score - previousScoredUser.score
                  : 0;
              return {
                position: index + 1,
                user: user,
                score: scoredUser.score,
                progression: progression,
              } as LeaderboardUser;
            })
            .slice(0, 5);
        }),
      )
      .subscribe();
  }
}
