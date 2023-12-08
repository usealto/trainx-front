import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TeamDtoApi, TeamStatsDtoApi, UserStatsDtoApi } from '@usealto/sdk-ts-angular';
import { combineLatest, switchMap, tap } from 'rxjs';
import { EResolverData, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { Team } from 'src/app/models/team.model';
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

interface TeamDisplay extends TeamDtoApi {
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

  // Teams
  teams: TeamDtoApi[] = [];
  teamsStats: TeamStatsDtoApi[] = [];
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
  userFilters: UserFilters = { teams: [] as TeamDtoApi[], score: '' };
  isFilteredUsers = false;
  selectedItems: UserStatsDtoApi[] = [];

  rawUsers: User[] = [];
  teamNames: string[] = [];

  constructor(
    private readonly offcanvasService: NgbOffcanvas,
    private readonly teamsRestService: TeamsRestService,
    private readonly usersService: UsersService,
    private readonly scoreRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
    private modalService: NgbModal,
    private replaceInTranslationPipe: ReplaceInTranslationPipe,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.rawUsers = Array.from((data[EResolverData.AppData] as IAppData).userById.values());
    this.teamNames = Array.from((data[EResolverData.AppData] as IAppData).teamById.values()).map(
      (teams) => teams.name,
    );
    this.loadData();
  }

  loadData() {
    combineLatest([
      this.scoreRestService.getTeamsStats(ScoreDuration.Month),
      this.scoreRestService.getUsersStats(ScoreDuration.Month),
      this.scoreRestService.getUsersStats(ScoreDuration.Month, true),
    ])
      .pipe(
        tap(([teamsStats, usersStats, previousUsersStats]) => {
          this.teams = teamsStats.map((teamStat) => teamStat.team);
          this.teamsStats = teamsStats;
          this.teamsScores = this.teamsStats.map((teamStat) => ({
            ...teamStat.team,
            score: teamStat.score,
            totalGuessesCount: teamStat.totalGuessesCount,
            validGuessesCount: teamStat.validGuessesCount,
            questionsPushedCount: teamStat.questionsPushedCount,
          }));

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

  openTeamForm(team?: TeamDtoApi) {
    const canvasRef = this.offcanvasService.open(TeamFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.team = team;
    canvasRef.componentInstance.users = this.rawUsers;
    canvasRef.componentInstance.teamNames = this.teamNames;
    canvasRef.componentInstance.teamChanged.pipe(tap(() => this.loadData())).subscribe();
  }

  deleteTeam(team: TeamDtoApi) {
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
        switchMap(() => this.teamsRestService.deleteTeam(team.id)),
        tap(() => {
          this.teamsRestService.resetCache();
          this.loadData();
          modalRef.close();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  openUserEditionForm(user: UserStatsDtoApi) {
    const canvasRef = this.offcanvasService.open(UserEditFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.user = user.user;
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
