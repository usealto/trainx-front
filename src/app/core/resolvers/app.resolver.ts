import { Resolve } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Observable, combineLatest, map, switchMap, tap } from 'rxjs';

import { EmojiMap, emojiData } from '../utils/emoji/data';
import { Injectable } from '@angular/core';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { User } from 'src/app/models/user.model';
import { Team } from 'src/app/models/team.model';

import * as FromRoot from '../store/root/';
import { RootState } from '../store/root/root.reducer';
import { setCompany, setTeams, setUserMe } from '../store/root/root.action';
import { Company } from 'src/app/models/company.model';

@Injectable()
export class AppResolver implements Resolve<Promise<void>> {
  delay = 30000;
  constructor(
    private readonly store: Store<RootState>,
    private readonly usersRestService: UsersRestService,
    private readonly teamsRestService: TeamsRestService,
    private readonly companiesRestService: CompaniesRestService,
  ) {}

  resolve(): Observable<Promise<void>> {
    emojiData.forEach((emoji) => {
      EmojiMap.set(emoji.id, emoji);
    });

    return this.store.pipe(
      select(FromRoot.selectTimestamp),
      tap((timestamp) => {
        if (timestamp && Date.now() - timestamp.getTime() > this.delay) {
          return combineLatest([this.usersRestService.getMe(), this.teamsRestService.getTeams()]).pipe(
            map(([userDto, teamsDto]) => {
              const me = User.fromDto(userDto);
              const teams = teamsDto.map(Team.fromDto);

              this.store.dispatch(setUserMe({ user: me }));
              this.store.dispatch(setTeams({ teams }));

              return me;
            }),
            switchMap((me) => {
              return this.companiesRestService.getCompanyById(me.companyId);
            }),
            tap((companyDto) => {
              this.store.dispatch(setCompany({ company: Company.fromDto(companyDto) }));
            }),
          );
        }
        return;
      }),
      map(() => Promise.resolve()),
    );
  }
}
