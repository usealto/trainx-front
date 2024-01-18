import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { UserStatsDtoApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, of, startWith, switchMap, tap } from 'rxjs';
import { IAppData } from 'src/app/core/resolvers';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { Team, TeamStats } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { UserFilters } from 'src/app/modules/profile/models/user.model';
import { UsersService } from 'src/app/modules/profile/services/users.service';
import { DeleteModalComponent } from 'src/app/modules/shared/components/delete-modal/delete-modal.component';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration, ScoreFilter } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { setCompany, setTeams } from '../../../../core/store/root/root.action';
import * as FromRoot from '../../../../core/store/store.reducer';
import { ReplaceInTranslationPipe } from '../../../../core/utils/i18n/replace-in-translation.pipe';
import { Company } from '../../../../models/company.model';
import { Program } from '../../../../models/program.model';
import { ProgramsRestService } from '../../../programs/services/programs-rest.service';
import { TeamFormComponent } from '../team-form/team-form.component';
import { UserEditFormComponent } from '../user-edit-form/user-edit-form.component';
import { FormControl } from '@angular/forms';
import { PillOption, SelectOption } from '../../../shared/models/select-option.model';
import { Score } from '../../../../models/score.model';

interface TeamDisplay {
  id: string;
  name: string;
  team: Team;
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
  teams: Team[] = [];
  teamsStats: TeamStats[] = [];
  paginatedTeams: TeamDisplay[] = [];
  teamsDataStatus: PlaceholderDataStatus = 'loading';
  teamsPageControl = new FormControl(1, { nonNullable: true });
  teamsPageSize = 5;
  teamsScores: TeamDisplay[] = [];

  // Users
  absoluteUsersCount = 0;
  usersCount = 0;
  usersDataStatus: PlaceholderDataStatus = 'loading';

  users: UserStatsDtoApi[] = [];
  previousUsersStats: UserStatsDtoApi[] = [];

  usersTotalQuestions = 0;
  usersTotalQuestionsProgression: number | null = 0;
  usersQuestionProgression = new Map<string, number>();

  selectedItems: UserStatsDtoApi[] = [];

  rawUsers: User[] = [];
  teamNames: string[] = [];

  usersPageSize = 5;
  usersData: IUserWithStats[] = [];
  filteredUsersData: IUserWithStats[] = [];

  usersPageControl = new FormControl(1, { nonNullable: true });
  searchControl: FormControl<string | null> = new FormControl();
  selectedTeams: FormControl<FormControl<SelectOption>[]> = new FormControl(
    [] as FormControl<SelectOption>[],
    { nonNullable: true },
  );
  teamOptions: SelectOption[] = [];
  selectedScores: FormControl<FormControl<PillOption>[]> = new FormControl([] as FormControl<PillOption>[], {
    nonNullable: true,
  });
  scoreOptions: PillOption[] = Score.getFiltersPillOptions();

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
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = (data[EResolvers.AppResolver] as IAppData).company;
    this.rawUsers = Array.from((data[EResolvers.AppResolver] as IAppData).userById.values());
    this.usersDataStatus = this.rawUsers.length === 0 ? 'noData' : 'good';

    this.teams = this.company.teams;
    this.teamOptions = this.teams.map((team) => new SelectOption({ label: team.name, value: team.id }));
    this.programs = this.company.programs;
    this.teamNames = this.teams.map((team) => team.name);
    this.teamsStats = this.company.getStatsByPeriod(ScoreDuration.Month, false);
    this.teamsScores = this.teams.map((team) => {
      const matchingStats = this.teamsStats.find((teamStat) => teamStat.teamId === team.id);
      if (!matchingStats) {
        return {
          id: team.id,
          name: team.name,
          team: team,
          score: 0,
          totalGuessesCount: 0,
          validGuessesCount: 0,
          questionsPushedCount: 0,
        } as TeamDisplay;
      }

      return {
        id: team.id,
        name: team.name,
        team: team,
        score: matchingStats.score,
        totalGuessesCount: matchingStats.totalGuessesCount,
        validGuessesCount: matchingStats.validGuessesCount,
        questionsPushedCount: matchingStats.questionsPushedCount,
      } as TeamDisplay;
    });

    // users subscription
    this.leadTeamComponentSubscription.add(
      combineLatest([
        this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
        this.selectedTeams.valueChanges.pipe(startWith(this.selectedTeams.value)),
        this.selectedScores.valueChanges.pipe(startWith(this.selectedScores.value)),
        this.usersPageControl.valueChanges.pipe(startWith(this.usersPageControl.value)),
      ])
        .pipe(
          switchMap(([searchTerm, selectedTeamsControls, selectedScoresControls, page]) => {
            // TODO : API call with all params

            return of(null);
          }),
        )
        .subscribe(),
    );

    // teams subscription
    this.leadTeamComponentSubscription.add(
      this.teamsPageControl.valueChanges.pipe(startWith(this.teamsPageControl.value)).subscribe((page) => {
        this.changeTeamsPage(page);
      }),
    );

    // this.leadTeamComponentSubscription.add(
    //   combineLatest([
    //     this.scoreRestService.getUsersStats(ScoreDuration.Month),
    //     this.scoreRestService.getUsersStats(ScoreDuration.Month, true),
    //   ])
    //     .pipe(
    //       tap(([usersStats, previousUsersStats]) => {
    //         this.users = usersStats;
    //         this.usersTotalQuestions = usersStats.reduce(
    //           (prev, curr) => prev + (curr.totalGuessesCount || 0),
    //           0,
    //         );

    //         this.usersTotalQuestionsProgression = this.scoreService.getProgression(
    //           this.usersTotalQuestions,
    //           previousUsersStats.reduce((prev, curr) => prev + (curr.totalGuessesCount || 0), 0),
    //         );
    //         this.previousUsersStats = previousUsersStats;
    //         this.absoluteUsersCount = this.users.length;

    //         this.users.forEach((user) => {
    //           const member = this.teams.find((team) => team.id === user.teamId);
    //           this.usersMap.set(user.id, member ? member.name : '');
    //         });

    //         this.changeTeamsPage(1);
    //         this.filteredUsersData = this.users;
    //         this.changeUsersPage(this.users, 1);
    //       }),
    //     )
    //     .subscribe(),
    // );

    this.leadTeamComponentSubscription.add(
      this.teamsPageControl.valueChanges.subscribe((page) => {
        this.changeTeamsPage(page);
      }),
    );
  }

  ngOnDestroy(): void {
    this.leadTeamComponentSubscription.unsubscribe();
  }

  loadData() {
    return combineLatest([
      this.scoreRestService.getUsersStats(ScoreDuration.Month),
      this.scoreRestService.getUsersStats(ScoreDuration.Month, true),
    ]).subscribe();
  }

  changeTeamsPage(page: number) {
    this.paginatedTeams = this.teamsScores.slice((page - 1) * this.teamsPageSize, page * this.teamsPageSize);
    this.teamsDataStatus = this.paginatedTeams.length === 0 ? 'noData' : 'good';
  }

  resetFilters() {
    this.searchControl.patchValue(null);
    this.selectedTeams.patchValue([]);
    this.selectedScores.patchValue([]);
    this.usersPageControl.patchValue(1);
  }

  openTeamForm(team?: Team) {
    const canvasRef = this.offcanvasService.open(TeamFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    const instance = canvasRef.componentInstance as TeamFormComponent;

    instance.team = team;
    instance.programs = this.programs;
    instance.users = this.rawUsers;
    instance.teamsNames = this.teamNames;

    canvasRef.closed
      .pipe(
        switchMap(() => {
          return combineLatest([this.teamsRestService.getTeams(), this.programsRestService.getProgramsObj()]);
        }),
      )
      .subscribe({
        next: ([teams, programs]) => {
          const updatedCompany = new Company({
            ...this.company.rawData,
            teams: teams.map((team) => team.rawData),
            programs: programs.map((program) => program.rawData),
          });
          this.store.dispatch(setCompany({ company: updatedCompany }));
        },
      });
  }

  deleteTeam(team: Team) {
    const modalRef = this.modalService.open(DeleteModalComponent, {
      centered: true,
      size: 'md',
    });

    const componentInstance = modalRef.componentInstance as DeleteModalComponent;
    componentInstance.data = {
      title: this.replaceInTranslationPipe.transform(I18ns.leadTeam.teams.deleteModal.title, team.name),
      subtitle: this.replaceInTranslationPipe.transform(
        I18ns.leadTeam.teams.deleteModal.subtitle,
        this.getTeamUsersCount(team.id),
      ),
    };

    componentInstance.objectDeleted
      .pipe(
        switchMap(() => {
          return this.teamsRestService.deleteTeam(team.id);
        }),
        switchMap(() => {
          return this.teamsRestService.getTeams();
        }),
        tap((teams) => {
          this.store.dispatch(setTeams({ teams }));
          modalRef.close();
        }),
      )
      .subscribe();
  }

  openUserEditionForm(user: UserStatsDtoApi) {
    const canvasRef = this.offcanvasService.open(UserEditFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    const instance = canvasRef.componentInstance as UserEditFormComponent;

    instance.user = User.fromDto(user.user);
    instance.teams = this.teams;
    canvasRef.closed.pipe(tap(() => this.loadData())).subscribe();
  }

  @memoize()
  getTeamUsersCount(teamId: string): number {
    return this.users.filter((user) => user.teamId === teamId).length;
  }

  @memoize()
  getQuestionsByUser(id: string, guessCount = 0): number | null {
    return this.scoreService.getProgression(
      guessCount,
      this.previousUsersStats.find((u) => u.user.id === id)?.totalGuessesCount,
    );
  }
}
