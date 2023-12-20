import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ProgramDtoApi, TeamDtoApi, TeamStatsDtoApi, UserStatsDtoApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, switchMap, tap } from 'rxjs';
import { EResolverData, ResolversService } from 'src/app/core/resolvers/resolvers.service';
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
import { ReplaceInTranslationPipe } from '../../../../core/utils/i18n/replace-in-translation.pipe';
import { TeamFormComponent } from '../team-form/team-form.component';
import { UserEditFormComponent } from '../user-edit-form/user-edit-form.component';
import { IAppData } from 'src/app/core/resolvers';
import { Company, ICompany } from '../../../../models/company.model';
import { ITeamStatsData } from '../../../../core/resolvers/teamStats.resolver';
import { ProgramsRestService } from '../../../programs/services/programs-rest.service';
import { Program } from '../../../../models/program.model';
import { IProgramsData } from '../../../../core/resolvers/programs.resolver';
import { Store } from '@ngrx/store';
import * as FromRoot from '../../../../core/store/store.reducer';
import { setPrograms, setTeams } from '../../../../core/store/root/root.action';

interface TeamDisplay {
  id: string;
  name: string;
  team: Team;
  score?: number;
  totalGuessesCount?: number;
  validGuessesCount?: number;
  questionsPushedCount?: number;
}

@UntilDestroy()
@Component({
  selector: 'alto-lead-team',
  templateUrl: './lead-team.component.html',
  styleUrls: ['./lead-team.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class LeadTeamComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;

  company: Company = {} as Company;

  programs: Program[] = [];

  // Teams
  teams: Team[] = [];
  teamsStats: TeamStats[] = [];
  paginatedTeams: TeamDisplay[] = [];
  teamsDataStatus: PlaceholderDataStatus = 'loading';
  teamsPage = 1;
  teamsPageSize = 5;
  teamsScores: TeamDisplay[] = [];
  // Users
  absoluteUsersCount = 0;
  usersCount = 0;
  usersDataStatus: PlaceholderDataStatus = 'loading';
  usersMap = new Map<string, string>();
  users: UserStatsDtoApi[] = [];
  previousUsersStats: UserStatsDtoApi[] = [];
  paginatedUsers: UserStatsDtoApi[] = [];
  usersPage = 1;
  usersPageSize = 5;
  filteredUsers: UserStatsDtoApi[] = [];
  usersTotalQuestions = 0;
  usersTotalQuestionsProgression: number | null = 0;
  usersQuestionProgression = new Map<string, number>();
  userFilters: UserFilters = { teams: [] as Team[], score: '' };
  isFilteredUsers = false;
  selectedItems: UserStatsDtoApi[] = [];

  rawUsers: User[] = [];
  teamNames: string[] = [];

  constructor(
    private readonly offcanvasService: NgbOffcanvas,
    private readonly teamsRestService: TeamsRestService,
    private readonly programsRestService: ProgramsRestService,
    private readonly usersService: UsersService,
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
    this.rawUsers = Array.from((data[EResolverData.AppData] as IAppData).userById.values());

    this.store
      .select(FromRoot.selectCompany)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ data: company }) => {
          this.company = company;
          this.teams = this.company.teams;
          console.log('hello hello team length:', this.teams.length );
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
          this.loadData();
        },
      });
  }

  loadData() {
    combineLatest([
      this.scoreRestService.getUsersStats(ScoreDuration.Month),
      this.scoreRestService.getUsersStats(ScoreDuration.Month, true),
    ])
      .pipe(
        tap(([usersStats, previousUsersStats]) => {
          this.users = usersStats;
          this.usersTotalQuestions = usersStats.reduce(
            (prev, curr) => prev + (curr.totalGuessesCount || 0),
            0,
          );

          this.usersTotalQuestionsProgression = this.scoreService.getProgression(
            this.usersTotalQuestions,
            previousUsersStats.reduce((prev, curr) => prev + (curr.totalGuessesCount || 0), 0),
          );
          this.previousUsersStats = previousUsersStats;
          this.absoluteUsersCount = this.users.length;

          this.users.forEach((user) => {
            const member = this.teams.find((team) => team.id === user.teamId);
            this.usersMap.set(user.id, member ? member.name : '');
          });
        }),
        tap(() => this.changeTeamsPage(1)),
        tap(() => {
          this.filteredUsers = this.users;
          this.changeUsersPage(this.users, 1);
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  changeTeamsPage(page: number) {
    this.teamsPage = page;
    this.paginatedTeams = this.teamsScores.slice((page - 1) * this.teamsPageSize, page * this.teamsPageSize);
    this.teamsDataStatus = this.paginatedTeams.length === 0 ? 'noData' : 'good';
  }

  filterUsers(
    {
      teams = this.userFilters.teams,
      score = this.userFilters.score,
      search = this.userFilters.search,
    }: UserFilters = this.userFilters,
  ) {
    this.userFilters.teams = teams;
    this.userFilters.score = score;
    this.userFilters.search = search;

    let output = this.usersService.filterUsers<UserStatsDtoApi[]>(this.users, {
      teams,
      search,
    });
    if (score) {
      output = this.scoreService.filterByScore(output, score as ScoreFilter, true);
    }
    this.filteredUsers = output;
    this.isFilteredUsers = true;
    this.changeUsersPage(output, 1);
  }

  resetFilters() {
    this.filterUsers((this.userFilters = {}));
    this.selectedItems = [];
    this.isFilteredUsers = false;
  }

  changeUsersPage(users: UserStatsDtoApi[], page: number) {
    this.usersPage = page;
    this.usersCount = users.length;
    this.paginatedUsers = this.filteredUsers.slice(
      (page - 1) * this.usersPageSize,
      page * this.usersPageSize,
    );
    this.usersDataStatus =
      this.paginatedUsers.length === 0 ? (this.isFilteredUsers ? 'noResult' : 'noData') : 'good';
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

    instance.teamChanged
      .pipe(
        switchMap(() => {
          return this.teamsRestService.getTeams();
        }),
        tap((teams) => {
          this.store.dispatch(setTeams({ teams }));
        }),
        switchMap(() => {
          return this.programsRestService.getProgramsObj();
        }),
        tap((programs) => {
          this.store.dispatch(setPrograms({ programs }));
        }),

      )
      .subscribe();
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
