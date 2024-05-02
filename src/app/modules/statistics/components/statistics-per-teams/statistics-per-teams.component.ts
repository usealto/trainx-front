import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserStatsDtoApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, concat, debounceTime, of, startWith, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { SelectOption } from 'src/app/modules/shared/models/select-option.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../core/resolvers';
import { EResolvers, ResolversService } from '../../../../core/resolvers/resolvers.service';
import { Company } from '../../../../models/company.model';
import { Team, TeamStats } from '../../../../models/team.model';
import { User } from '../../../../models/user.model';
import { EPlaceholderStatus } from '../../../shared/components/placeholder-manager/placeholder-manager.component';
import { DataForTable } from '../../models/statistics.model';
import { ILeadData } from '../../../../core/resolvers/lead.resolver';
import { EScoreDuration, Score } from '../../../../models/score.model';
import { BaseStats } from '../../../../models/stats.model';

@Component({
  selector: 'alto-statistics-per-teams',
  templateUrl: './statistics-per-teams.component.html',
  styleUrls: ['./statistics-per-teams.component.scss'],
})
export class StatisticsPerTeamsComponent implements OnInit, OnDestroy {
  Emoji = EmojiName;
  I18ns = I18ns;
  EPlaceholderStatus = EPlaceholderStatus;

  durationOptions = Score.getTimepickerOptions();
  durationControl: FormControl<EScoreDuration> = new FormControl<EScoreDuration>(EScoreDuration.Year, {
    nonNullable: true,
  });
  searchControl = new FormControl<string | null>(null);
  teamsControl = new FormControl([] as FormControl<SelectOption>[], { nonNullable: true });
  teamsOptions: SelectOption[] = [];

  company!: Company;
  usersById: Map<string, User> = new Map();
  members: DataForTable[] = [];

  membersDisplay: DataForTable[] = [];
  membersDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  teamsDisplay: DataForTable[] = [];
  teamsDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;

  private statisticsPerTeamsComponentSubscription = new Subscription();

  constructor(
    private readonly scoreRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
    private readonly resolversService: ResolversService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.usersById = (data[EResolvers.AppResolver] as IAppData).userById;
    this.company = (data[EResolvers.LeadResolver] as ILeadData).company;
    this.teamsOptions = this.company.teams.map(
      (team) => new SelectOption({ label: team.name, value: team.id }),
    );

    this.statisticsPerTeamsComponentSubscription.add(
      combineLatest([
        concat(of(this.searchControl.value), this.searchControl.valueChanges.pipe(debounceTime(300))),
        this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)),
        this.teamsControl.valueChanges.pipe(startWith(this.teamsControl.value)),
      ])
        .pipe(
          switchMap(([search, duration, teams]) => {
            return combineLatest([
              this.scoreRestService.getPaginatedUsersStats(duration, false, {
                search: search || undefined,
                teamIds: teams.map(({ value }) => value.value).join(','),
              }),
              this.scoreRestService.getPaginatedUsersStats(duration, true, {
                search: search || undefined,
                teamIds: teams.map(({ value }) => value.value).join(','),
              }),
              of(duration),
            ]);
          }),
          tap(([{ data: usersStats = [] }, { data: prevUsersStats = [] }, duration]) => {
            const teamsStats = this.company.getStatsByPeriod(duration, false);
            const prevTeamsStats = this.company.getStatsByPeriod(duration, true);

            this.teamsDisplay = teamsStats.sort(BaseStats.baseStatsCmp).map((teamStats) =>
              this.dataForTeamTableMapper(
                this.company.teamById.get(teamStats.teamId),
                teamStats,
                prevTeamsStats.find((s) => s.teamId === teamStats.teamId),
              ),
            );

            this.membersDisplay = usersStats.map((userStats) =>
              this.dataForMembersTableMapper(
                this.usersById.get(userStats.id),
                userStats,
                prevUsersStats.find((s) => s.id === userStats.id),
              ),
            );
          }),
        )
        .subscribe(() => {
          this.teamsDataStatus =
            this.teamsDisplay.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_DATA;

          this.membersDataStatus =
            this.membersDisplay.length <= 0
              ? this.searchControl.value !== '' || this.teamsControl.value.length > 0
                ? EPlaceholderStatus.NO_RESULT
                : EPlaceholderStatus.NO_DATA
              : EPlaceholderStatus.GOOD;
        }),
    );
  }

  ngOnDestroy(): void {
    this.statisticsPerTeamsComponentSubscription.unsubscribe();
  }

  dataForTeamTableMapper(team?: Team, t?: TeamStats, tProg?: TeamStats): DataForTable {
    return {
      team: team,
      globalScore: t?.score,
      answeredQuestionsCount: t?.totalGuessesCount,
      answeredQuestionsProgression:
        this.scoreService.getProgression(t?.totalGuessesCount, tProg?.totalGuessesCount) ?? 0,
      commentsCount: t?.commentsCount,
      commentsProgression: this.scoreService.getProgression(t?.commentsCount, tProg?.commentsCount) ?? 0,
      submittedQuestionsCount: t?.questionsSubmittedCount,
      submittedQuestionsProgression:
        this.scoreService.getProgression(t?.questionsSubmittedCount, tProg?.questionsSubmittedCount) ?? 0,
      leastMasteredTags: t?.tagStats
        ?.filter((ta) => (ta.score ?? 0) < 50)
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .slice(0, 3)
        .map((t) => t.name),
    } as DataForTable;
  }

  dataForMembersTableMapper(user?: User, u?: UserStatsDtoApi, uProg?: UserStatsDtoApi): DataForTable {
    return {
      owner: user,
      globalScore: u?.score,
      answeredQuestionsCount: u?.totalGuessesCount,
      answeredQuestionsProgression:
        this.scoreService.getProgression(u?.totalGuessesCount, uProg?.totalGuessesCount) ?? 0,
      commentsCount: u?.commentsCount,
      commentsProgression: this.scoreService.getProgression(u?.commentsCount, uProg?.commentsCount) ?? 0,
      submittedQuestionsCount: u?.questionsSubmittedCount,
      submittedQuestionsProgression:
        this.scoreService.getProgression(u?.questionsSubmittedCount, uProg?.questionsSubmittedCount) ?? 0,
      leastMasteredTags: u?.tags
        ?.filter((ta) => (ta.score ?? 0) < 50)
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .slice(0, 3)
        .map((t) => t.tag.name),
    } as DataForTable;
  }
}
