import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GuessDtoApi, UserDtoApi } from '@usealto/sdk-ts-angular';
import { addDays } from 'date-fns';
import { Subscription, combineLatest, switchMap, tap } from 'rxjs';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { User } from 'src/app/models/user.model';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { GuessesRestService } from 'src/app/modules/training/services/guesses-rest.service';
import { IAppData } from '../../../../core/resolvers';
import { Program } from '../../../../models/program.model';
import { ITrainingCardData } from '../../../shared/components/training-card/training-card.component';
import { ITabOption } from '../../../shared/components/tabs/tabs.component';
import { EScoreDuration } from '../../../../models/score.model';

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
export class UserHomeComponent implements OnInit, OnDestroy {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
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
  durationOptions: ITabOption[] = [
    { label: I18ns.shared.dateFilter.week, value: EScoreDuration.Week },
    { label: I18ns.shared.dateFilter.month, value: EScoreDuration.Month },
    { label: I18ns.shared.dateFilter.year, value: EScoreDuration.Year },
  ];
  durationControl = new FormControl<ITabOption>(this.durationOptions[0], {
    nonNullable: true,
  });
  leaderboardUsers: LeaderboardUser[] | undefined = undefined;

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
        this.programRunsRestService.getUserProgramRuns(
          this.user.id,
          this.programs.map(({ id }) => id),
        ),
        this.guessesRestService.getGuesses({
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
          switchMap((duration) => {
            return combineLatest([
              this.scoreRestService.getPaginatedUsersStats(duration.value),
              this.scoreRestService.getPaginatedUsersStats(duration.value, true),
            ]);
          }),
        )
        .subscribe({
          next: ([{ data: usersStats = [] }, { data: previousUsersStats = [] }]) => {
            const filteredUsersStats = usersStats.filter((user) => user.teamId === this.user.teamId);
            const filteredPreviousScoredUsers = previousUsersStats.filter(
              (user) => user.teamId === this.user.teamId,
            );

            this.leaderboardUsers = filteredUsersStats
              .map((scoredUser, index) => {
                const user = this.users.find((user) => user.id === scoredUser.id);
                const previousScoredUser = filteredPreviousScoredUsers.find(
                  (user) => user.id === scoredUser.id,
                );
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
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.userHomeComponentSubscription.unsubscribe();
  }
}
