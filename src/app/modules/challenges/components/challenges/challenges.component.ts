import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import {
  ChallengeDtoApi,
  ChallengeTypeEnumApi,
  TeamDtoApi,
  UserDtoApi,
  ChallengeDtoApiStatusEnumApi,
} from '@usealto/sdk-ts-angular';
import { ChallengesRestService } from '../../services/challenges-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';

@Component({
  selector: 'alto-challenges',
  templateUrl: './challenges.component.html',
  styleUrls: ['./challenges.component.scss'],
})
export class ChallengesComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  ChallengeTypeEnumApi = ChallengeTypeEnumApi;
  pageSize = 7;
  //
  byTeamPage = 1;
  byTeamCount = 0;
  challengesByTeam: ChallengeDtoApi[] = [];
  challengesByTeamDisplay: ChallengeDtoApi[] = [];
  byTeamSelectedStatus?: { label: string; value: string };
  //
  byUserPage = 1;
  byUserCount = 0;
  challengesByUser: ChallengeDtoApi[] = [];
  challengesByUserDisplay: ChallengeDtoApi[] = [];
  filters: { teams?: TeamDtoApi[]; status?: string; search?: string } = {};
  byUserSelectedStatus?: { label: string; value: string };
  //
  status = [
    { value: ChallengeDtoApiStatusEnumApi.Ended, label: I18ns.shared.status.ended },
    { value: ChallengeDtoApiStatusEnumApi.InProgress, label: I18ns.shared.status.ongoing },
    // { value: null, label: I18ns.shared.status.incoming },
  ];

  constructor(
    private readonly challengesRestService: ChallengesRestService,
    private readonly userService: UsersRestService,
    public readonly teamStore: TeamStore,
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.challengesRestService.getChallengesPaginated({
        itemsPerPage: 500,
        sortBy: 'endDate:desc',
        type: ChallengeTypeEnumApi.ByTeam,
      }),
      this.challengesRestService.getChallengesPaginated({
        itemsPerPage: 500,
        sortBy: 'endDate:desc',
        type: ChallengeTypeEnumApi.ByUser,
      }),
    ])
      .pipe(
        tap(([byTeam, byUser]) => {
          this.challengesByTeam = this.challengesByTeamDisplay = byTeam.data ?? [];
          this.byTeamCount = byTeam.meta.totalItems;
          this.challengesByUser = this.challengesByUserDisplay = byUser.data ?? [];
          this.byUserCount = byUser.meta.totalItems;
        }),
      )
      .subscribe();
  }

  filterChallengesByTeam(teams: TeamDtoApi[], type: ChallengeTypeEnumApi) {
    this.filters.teams = teams;

    if (type === ChallengeTypeEnumApi.ByTeam) {
      this.challengesByTeamDisplay = !teams.length
        ? this.challengesByTeam
        : this.challengesByTeam.filter((ch) => this.filterByTeam(ch, teams));
    } else {
      this.challengesByUserDisplay = !teams.length
        ? this.challengesByUser
        : this.challengesByUser.filter((ch) => this.filterByTeam(ch, teams));
    }
  }

  search(val: string, type: ChallengeTypeEnumApi) {
    const str = val.toLowerCase();
    this.filters.search = str;

    if (type === ChallengeTypeEnumApi.ByTeam) {
      this.challengesByTeamDisplay = !str.length
        ? this.challengesByTeam
        : this.challengesByTeam.filter((ch) => ch.name.toLowerCase().includes(str));
    } else {
      this.challengesByUserDisplay = !str.length
        ? this.challengesByUser
        : this.challengesByUser.filter((ch) => ch.name.toLowerCase().includes(str));
    }
  }

  filterByTeam(ch: ChallengeDtoApi, teams: TeamDtoApi[]): boolean {
    if (!ch.teams) {
      return false;
    }
    return ch.teams.some((t) => teams.some((te) => te.id === t.id));
  }

  @memoize()
  getUser(id: string): Observable<UserDtoApi | null | undefined> {
    if (!id) {
      return of(null);
    }
    return this.userService.getUsersFiltered({ ids: id }).pipe(map((u) => u.shift()));
  }

  filterByStatus(type: ChallengeTypeEnumApi) {
    if (type === ChallengeTypeEnumApi.ByTeam) {
      this.challengesByTeamDisplay = this.byTeamSelectedStatus
        ? this.challengesByTeamDisplay.filter((ch) => ch.status === this.byTeamSelectedStatus?.value)
        : this.challengesByTeam;
    } else {
      this.challengesByUserDisplay = this.byUserSelectedStatus
        ? this.challengesByUserDisplay.filter((ch) => ch.status === this.byUserSelectedStatus?.value)
        : this.challengesByUser;
    }
  }
}
