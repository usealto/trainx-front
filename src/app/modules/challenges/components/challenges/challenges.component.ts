import { Component, OnInit } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ChallengeApi, ChallengeTypeEnumApi } from 'src/app/sdk';
import { ChallengesRestService } from '../../services/challenges-rest.service';
import { map, tap } from 'rxjs';
import { memoize } from 'src/app/core/utils/memoize/memoize';

@Component({
  selector: 'alto-challenges',
  templateUrl: './challenges.component.html',
  styleUrls: ['./challenges.component.scss'],
})
export class ChallengesComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  challengesByTeam: ChallengeApi[] = [];
  challengesByUser: ChallengeApi[] = [];

  constructor(
    private readonly challengesRestService: ChallengesRestService,
    private readonly userService: UsersRestService,
  ) {}

  ngOnInit(): void {
    this.challengesRestService
      .getChallenges({ itemsPerPage: 500, sortBy: 'endDate:desc' })
      .pipe(
        tap((challenges) => {
          this.challengesByTeam = challenges
            .filter((c) => c.type === ChallengeTypeEnumApi.ByTeam)
            .slice(0, 5);
          this.challengesByUser = challenges
            .filter((c) => c.type === ChallengeTypeEnumApi.ByUser)
            .slice(0, 5);
        }),
      )
      .subscribe();
  }

  @memoize()
  getUser(id: string) {
    return this.userService.getUsers({ ids: id }).pipe(map((u) => u.shift()));
  }
}
