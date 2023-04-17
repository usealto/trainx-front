import { Component, OnInit } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ChallengeApi, ChallengeTypeEnumApi } from 'src/app/sdk';
import { ChallengesRestService } from '../../services/challenges-rest.service';
import { combineLatest, map, tap } from 'rxjs';
import { memoize } from 'src/app/core/utils/memoize/memoize';

@Component({
  selector: 'alto-challenges',
  templateUrl: './challenges.component.html',
  styleUrls: ['./challenges.component.scss'],
})
export class ChallengesComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  pageSize = 5;
  //
  byTeamPage = 1;
  byTeamCount = 0;
  challengesByTeam: ChallengeApi[] = [];
  //
  byUserPage = 1;
  byUserCount = 0;
  challengesByUser: ChallengeApi[] = [];

  constructor(
    private readonly challengesRestService: ChallengesRestService,
    private readonly userService: UsersRestService,
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
          this.challengesByTeam = byTeam.data ?? [];
          this.byTeamCount = byTeam.meta.totalItems;
          this.challengesByUser = byUser.data ?? [];
          this.byUserCount = byUser.meta.totalItems;
        }),
      )
      .subscribe();
  }

  @memoize()
  getUser(id: string) {
    return this.userService.getUsers({ ids: id }).pipe(map((u) => u.shift()));
  }
}
