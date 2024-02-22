import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GuessDtoApi } from '@usealto/sdk-ts-angular';
import { addDays } from 'date-fns';
import { Subscription, combineLatest, startWith, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { User } from 'src/app/models/user.model';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';
import { IAppData } from '../../../../core/resolvers';
import { EmojiName } from '../../../../core/utils/emoji/data';
import { Program } from '../../../../models/program.model';
import { EScoreDuration } from '../../../../models/score.model';
import { ILeaderboardData } from '../../../shared/components/leaderboard/leaderboard.component';
import { ITrainingCardData } from '../../../shared/components/training-card/training-card.component';
import { EPlaceholderStatus } from '../../../shared/components/placeholder-manager/placeholder-manager.component';

@Component({
  selector: 'alto-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.scss'],
})
export class UserHomeComponent implements OnInit, OnDestroy {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  EmojiName = EmojiName;

  user!: User;
  users: User[] = [];
  programs: Program[] = [];
  ScoreDuration = EScoreDuration;
  //programs-run data
  guessesCount = 0;
  myProgramRunsCards: ITrainingCardData[] = [];
  //programs-run data
  continuousSessionUsers: User[] = [];

  //team data
  durationControl = new FormControl<EScoreDuration>(EScoreDuration.Trimester, {
    nonNullable: true,
  });
  leaderboardUsers: ILeaderboardData[] = [];
  leaderboardDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  pageSize = 2;
  pageControl: FormControl<number> = new FormControl(1, { nonNullable: true });
  private readonly userHomeComponentSubscription = new Subscription();

  constructor(
    private readonly guessesRestService: GuessesRestService,
    private readonly programRunsRestService: ProgramRunsRestService,
    private readonly scoreRestService: ScoresRestService,
    private readonly resolversService: ResolversService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.user = (data[EResolvers.AppResolver] as IAppData).me;
    this.users = Array.from((data[EResolvers.AppResolver] as IAppData).userById.values());
    this.programs = (data[EResolvers.AppResolver] as IAppData).company.programs;

    this.userHomeComponentSubscription.add(
      combineLatest([
        this.programRunsRestService.getAllProgramRuns({
          userId: this.user.id,
          programIds: this.programs.map(({ id }) => id).join(','),
        }),
        this.guessesRestService.getPaginatedGuesses({
          createdAfter: addDays(new Date(), -1),
          createdBefore: addDays(new Date(), 1),
        }),
      ])
        .pipe(
          tap(([programRuns, { data: guessesDtos }]) => {
            this.myProgramRunsCards = programRuns
              .filter(({ finishedAt, questionsCount }) => !finishedAt && questionsCount)
              .map((programRun) => {
                const program = this.programs.find(({ id }) => id === programRun.programId);

                return {
                  title: program?.name ?? '',
                  score: (programRun.goodGuessesCount / programRun.questionsCount) * 100,
                  updatedAt: programRun.updatedAt,
                  programRunId: programRun.id,
                  programId: programRun.programId,
                  expectation: program?.expectation ?? 0,
                  inProgress: !programRun.finishedAt,
                  duration: programRun.duration,
                };
              });

            const filteredAuthors = new Set(
              (guessesDtos as GuessDtoApi[])
                .filter(({ programRunIds }) => programRunIds?.length ?? 0)
                .map(({ author }) => author?.id),
            );

            this.continuousSessionUsers = Array.from(filteredAuthors).map((authorId) => {
              return this.users.find(({ id }) => id === authorId) as User;
            });
          }),
          switchMap(() => {
            return this.durationControl.valueChanges;
          }),
          startWith(this.durationControl.value),
          switchMap((duration) => {
            return combineLatest([
              this.scoreRestService.getAllUsersStats(duration),
              this.scoreRestService.getAllUsersStats(duration, true),
            ])
          }),
        )
        .subscribe({
          next: ([usersStats, previousUsersStats]) => {
            const filteredUsersStats = usersStats.filter((user) => user.teamId === this.user.teamId);
            const filteredPreviousScoredUsers = previousUsersStats.filter(
              (user) => user.teamId === this.user.teamId,
            );

            this.leaderboardUsers = filteredUsersStats
              .filter(({score}) => typeof score === 'number')
              .map((scoredUser) => {
                const user = this.users.find((user) => user.id === scoredUser.id);
                const previousScoredUser = filteredPreviousScoredUsers.find(
                  (user) => user.id === scoredUser.id,
                );
                const progression =
                  previousScoredUser && previousScoredUser.score && scoredUser.score
                    ? scoredUser.score - previousScoredUser.score
                    : 0;
                return {
                  name: user?.fullname as string,
                  score: scoredUser.score as number,
                  progression: progression,
                };
              })

            this.leaderboardDataStatus =
              this.leaderboardUsers.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.userHomeComponentSubscription.unsubscribe();
  }
}
