import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { GetUsersStatsRequestParams, UserStatsDtoApi } from '@usealto/sdk-ts-angular';
import {
  Subscription,
  combineLatest,
  concat,
  debounceTime,
  first,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { IAppData } from 'src/app/core/resolvers';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { DeleteModalComponent } from 'src/app/modules/shared/components/delete-modal/delete-modal.component';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { patchUser, setCompany, setTeams } from '../../../../core/store/root/root.action';
import * as FromRoot from '../../../../core/store/store.reducer';
import { ReplaceInTranslationPipe } from '../../../../core/utils/i18n/replace-in-translation.pipe';
import { Company } from '../../../../models/company.model';
import { Program } from '../../../../models/program.model';
import { EScoreDuration, EScoreFilter, Score } from '../../../../models/score.model';
import { ProgramsRestService } from '../../../programs/services/programs-rest.service';
import { EPlaceholderStatus } from '../../../shared/components/placeholder-manager/placeholder-manager.component';
import { PillOption, SelectOption } from '../../../shared/models/select-option.model';
import { GuessesRestService } from '../../../training/services/guesses-rest.service';
import { TeamFormComponent } from '../team-form/team-form.component';
import { UserEditFormComponent } from '../user-edit-form/user-edit-form.component';
import { ToastService } from '../../../../core/toast/toast.service';
import { ILeadData } from '../../../../core/resolvers/lead.resolver';
import { BaseStats } from '../../../../models/stats.model';

interface TeamDisplay {
  id: string;
  name: string;
  createdAt: Date;
  score?: number;
  totalGuessesCount?: number;
  validGuessesCount?: number;
  questionsPushedCount?: number;
}

interface IUserWithStats {
  user: User;
  stats: UserStatsDtoApi;
}

@Component({
  selector: 'alto-lead-team',
  templateUrl: './lead-team.component.html',
  styleUrls: ['./lead-team.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class LeadTeamComponent implements OnInit, OnDestroy {
  Emoji = EmojiName;
  I18ns = I18ns;

  company: Company = {} as Company;
  programs: Program[] = [];

  // Teams
  teamsById: Map<string, Team> = new Map();
  teamsPageSize = 5;

  teamsPageControl = new FormControl(1, { nonNullable: true });

  teamsDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  teamsDisplay: TeamDisplay[] = [];
  paginatedTeams: TeamDisplay[] = [];

  // Users
  rawUsers: User[] = [];
  totalGuessCount = 0;
  totalGuessCountProgression: number | null = 0;
  usersPageSize = 5;
  usersCount = 0;

  usersStats: UserStatsDtoApi[] = [];
  previousUsersStats: UserStatsDtoApi[] = [];

  usersPageControl = new FormControl(1, { nonNullable: true });
  searchControl: FormControl<string | null> = new FormControl();

  teamsOptions: SelectOption[] = [];
  selectedTeamsControl: FormControl<FormControl<SelectOption>[]> = new FormControl(
    [] as FormControl<SelectOption>[],
    { nonNullable: true },
  );

  scoreOptions: PillOption[] = Score.getFiltersPillOptions();
  selectedScoreControl: FormControl<PillOption | null> = new FormControl(null);

  usersDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  filteredUsersData: IUserWithStats[] = [];

  private readonly leadTeamComponentSubscription = new Subscription();

  constructor(
    private readonly offcanvasService: NgbOffcanvas,
    private readonly teamsRestService: TeamsRestService,
    private readonly programsRestService: ProgramsRestService,
    private readonly scoreRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
    private modalService: NgbModal,
    private replaceInTranslationPipe: ReplaceInTranslationPipe,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly store: Store<FromRoot.AppState>,
    private readonly guessesRestService: GuessesRestService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = (data[EResolvers.LeadResolver] as ILeadData).company;
    this.initFromCompany(this.company);
    this.rawUsers = Array.from((data[EResolvers.AppResolver] as IAppData).userById.values());

    // users subscription
    this.leadTeamComponentSubscription.add(
      combineLatest([
        this.guessesRestService.getPaginatedGuesses(undefined, EScoreDuration.Month, false),
        this.guessesRestService.getPaginatedGuesses(undefined, EScoreDuration.Month, true),
      ])
        .pipe(
          map(([totalGuesses, prevTotalGuesses]) => {
            return [
              totalGuesses.data ? totalGuesses.data.length : 0,
              prevTotalGuesses.data ? prevTotalGuesses.data.length : 0,
            ];
          }),
          tap(([guessesCount, prevGuessesCount]) => {
            this.totalGuessCount = guessesCount;
            this.totalGuessCountProgression =
              prevGuessesCount > 0 ? (guessesCount - prevGuessesCount) / prevGuessesCount : 0;
          }),
          switchMap(() => {
            return combineLatest([
              this.usersPageControl.valueChanges.pipe(startWith(this.usersPageControl.value)),
              combineLatest([
                concat(of(this.searchControl.value), this.searchControl.valueChanges.pipe(debounceTime(300))),
                this.selectedTeamsControl.valueChanges.pipe(startWith(this.selectedTeamsControl.value)),
                this.selectedScoreControl.valueChanges.pipe(startWith(this.selectedScoreControl.value)),
              ]).pipe(tap(() => this.usersPageControl.setValue(1))),
            ]);
          }),
          switchMap(([page, [searchTerm, selectedTeamsControls, selectedScore]]) => {
            let scoreAboveOrEqual: number | undefined;
            let scoreBelowOrEqual: number | undefined;

            switch (selectedScore?.value) {
              case EScoreFilter.Under25:
                scoreBelowOrEqual = 0.25;
                break;
              case EScoreFilter.Under50:
                scoreBelowOrEqual = 0.5;
                break;
              case EScoreFilter.Under75:
                scoreBelowOrEqual = 0.75;
                break;
              case EScoreFilter.Over25:
                scoreAboveOrEqual = 0.25;
                break;
              case EScoreFilter.Over50:
                scoreAboveOrEqual = 0.5;
                break;
              case EScoreFilter.Over75:
                scoreAboveOrEqual = 0.75;
                break;
            }

            const req: GetUsersStatsRequestParams = {
              page,
              itemsPerPage: this.usersPageSize,
              teamIds: selectedTeamsControls.map((control) => control.value.value).join(','),
              search: searchTerm || undefined,
              scoreAboveOrEqual,
              scoreBelowOrEqual,
            };

            return combineLatest([
              this.scoreRestService.getPaginatedUsersStats(EScoreDuration.Year, false, req),
              this.scoreRestService.getPaginatedUsersStats(EScoreDuration.Year, true, req),
            ]);
          }),
        )
        .subscribe(([{ meta, data: paginatedUsersStats = [] }, { data: prevPaginatedUsersStats = [] }]) => {
          this.usersCount = meta.totalItems;
          this.usersStats = paginatedUsersStats;
          this.previousUsersStats = prevPaginatedUsersStats;

          this.filteredUsersData = this.usersStats.map((userStats) => {
            const matchingUser = this.rawUsers.find((rawUser) => rawUser.id === userStats.user.id);
            return {
              user: matchingUser || User.fromDto(userStats.user),
              stats: userStats,
            };
          });
          this.usersDataStatus =
            this.usersStats.length > 0 ? EPlaceholderStatus.GOOD : EPlaceholderStatus.NO_RESULT;
        }),
    );

    // teams subscription
    this.leadTeamComponentSubscription.add(
      this.teamsPageControl.valueChanges.pipe(startWith(this.teamsPageControl.value)).subscribe((page) => {
        this.changeTeamsPage(page);
      }),
    );
  }

  ngOnDestroy(): void {
    this.leadTeamComponentSubscription.unsubscribe();
  }

  private initFromCompany(company: Company): void {
    this.programs = [...company.programs];
    this.teamsById = company.teamById;
    this.teamsOptions = Array.from(company.teamById.values()).map(
      (team) => new SelectOption({ label: team.name, value: team.id }),
    );
    const teamStats = company.getTeamStatsByPeriod(EScoreDuration.Year, false);

    this.teamsDisplay = teamStats.sort(BaseStats.baseStatsCmp).map((teamStat) => {
      const team = this.teamsById.get(teamStat.teamId);
      return {
        id: teamStat.teamId,
        name: team?.name as string,
        createdAt: team?.createdAt as Date,
        score: teamStat.score,
        totalGuessesCount: teamStat.totalGuessesCount,
        validGuessesCount: teamStat.validGuessesCount,
        questionsPushedCount:
          team?.programIds.reduce((acc, programId) => {
            const program = company.programById.get(programId);

            if (!program || !program.isActive) {
              return acc;
            }
            return acc + program.questionsCount;
          }, 0) ?? 0,
      };
    });

    this.teamsDataStatus =
      this.teamsDisplay.length === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;

    this.changeTeamsPage(this.teamsPageControl.value);
  }

  changeTeamsPage(page: number) {
    this.paginatedTeams = this.teamsDisplay.slice((page - 1) * this.teamsPageSize, page * this.teamsPageSize);
  }

  resetFilters() {
    this.searchControl.reset(null);
    this.selectedTeamsControl.reset([] as FormControl<SelectOption>[]);
    this.selectedScoreControl.reset(null);
    this.usersPageControl.reset(1);
  }

  openTeamForm(teamId?: string) {
    const canvasRef = this.offcanvasService.open(TeamFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    const instance = canvasRef.componentInstance as TeamFormComponent;

    instance.team = teamId ? this.teamsById.get(teamId) : undefined;
    instance.users = this.rawUsers;
    instance.company = this.company;

    instance.newTeam
      .pipe(
        switchMap((team) => {
          return combineLatest([of(team), this.programsRestService.getAllPrograms()]);
        }),
        switchMap(([team, programs]) => {
          const updatedCompany = new Company({
            ...this.company.rawData,
            teams: Array.from(this.teamsById.set(team.id, team).values()),
            programs: programs.map((program) => program.rawData),
          });

          this.store.dispatch(setCompany({ company: updatedCompany }));

          const teamIndex = this.teamsDisplay.findIndex((t) => t.id === team.id);
          if (this.teamsDisplay[teamIndex]) {
            this.teamsDisplay[teamIndex].name = team.name;
          }

          if (programs.length > 0) {
            programs.forEach((program) => {
              const i = this.programs.findIndex((p) => p.id === program.id);

              if (i !== -1) {
                this.programs[i] = program;
              }
            });
          }

          return this.store.select(FromRoot.selectCompany);
        }),
        first(),
      )
      .subscribe({
        next: ({ data: company }) => {
          this.company = company;
          this.initFromCompany(company);
        },
        complete: () => {
          this.toastService.show({
            type: 'success',
            text: I18ns.leadTeam.teams.form.teamCreated,
          });
        },
        error: () => {
          this.toastService.show({
            type: 'danger',
            text: I18ns.leadTeam.teams.form.teamCreationError,
          });
        },
      });
  }

  deleteTeam(teamId: string) {
    const modalRef = this.modalService.open(DeleteModalComponent, {
      centered: true,
      size: 'md',
    });

    const componentInstance = modalRef.componentInstance as DeleteModalComponent;
    componentInstance.data = {
      title: this.replaceInTranslationPipe.transform(
        I18ns.leadTeam.teams.deleteModal.title,
        this.teamsById.get(teamId)?.name,
      ),
      subtitle: this.replaceInTranslationPipe.transform(
        I18ns.leadTeam.teams.deleteModal.subtitle,
        this.getTeamUsersCount(teamId),
      ),
    };

    componentInstance.objectDeleted
      .pipe(
        switchMap(() => {
          return this.teamsRestService.deleteTeam(teamId);
        }),
        switchMap(() => {
          return this.teamsRestService.getTeams();
        }),
        switchMap((teams) => {
          this.store.dispatch(setTeams({ teams }));

          return this.store.select(FromRoot.selectCompany);
        }),
        first(),
      )
      .subscribe({
        next: ({ data: company }) => {
          this.company = company;
          this.initFromCompany(company);
        },
        complete: () => {
          modalRef.close();
          this.toastService.show({
            type: 'success',
            text: I18ns.leadTeam.teams.form.teamDeleted,
          });
        },
        error: () => {
          modalRef.close();
          this.toastService.show({
            type: 'danger',
            text: I18ns.leadTeam.teams.form.teamDeletionError,
          });
        },
      });
  }

  openUserEditionForm(user: User) {
    const canvasRef = this.offcanvasService.open(UserEditFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    const instance = canvasRef.componentInstance as UserEditFormComponent;

    instance.user = user;
    instance.teams = Array.from(this.teamsById.values());
    canvasRef.closed.subscribe((user) => {
      this.store.dispatch(patchUser({ user: user }));
    });
  }

  @memoize()
  getTeamUsersCount(teamId: string): number {
    return this.rawUsers.filter((user) => user.teamId === teamId).length;
  }

  @memoize()
  getQuestionsByUser(id: string, guessCount = 0): number | null {
    return this.scoreService.getProgression(
      guessCount,
      this.previousUsersStats.find((u) => u.user.id === id)?.totalGuessesCount,
    );
  }
}
