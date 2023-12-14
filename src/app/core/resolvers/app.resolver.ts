import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngrx/store';

import { Observable, combineLatest, map, of, switchMap } from 'rxjs';
import { Company } from '../../models/company.model';
import { Team } from '../../models/team.model';
import { User } from '../../models/user.model';
import { TeamsRestService } from '../../modules/lead-team/services/teams-rest.service';
import { UsersRestService } from '../../modules/profile/services/users-rest.service';
import { setTeams, setUsers } from '../store/root/root.action';
import { EmojiMap, emojiData } from '../utils/emoji/data';
import * as FromRoot from './../../core/store/store.reducer';

export interface IAppData {
  me: User;
  teamById: Map<string, Team>;
  userById: Map<string, User>;
  company: Company;
}

export const appResolver: ResolveFn<Observable<IAppData>> = () => {
  emojiData.forEach((emoji) => {
    EmojiMap.set(emoji.id, emoji);
  });

  const store = inject<Store<FromRoot.AppState>>(Store<FromRoot.AppState>);
  const usersRestService = inject<UsersRestService>(UsersRestService);
  const teamsRestService = inject<TeamsRestService>(TeamsRestService);

  return combineLatest([
    store.select(FromRoot.selectUserMe),
    store.select(FromRoot.selectUsers).pipe(
      switchMap((timestampedUsers) => {
        return timestampedUsers.needsUpdate()
          ? usersRestService.getUsers().pipe(
              switchMap((users) => {
                store.dispatch(setUsers({ users }));
                return store.select(FromRoot.selectUsers);
              }),
            )
          : of(timestampedUsers);
      }),
    ),
    store.select(FromRoot.selectTeams).pipe(
      switchMap((teams) => {
        return teams.needsUpdate()
          ? teamsRestService.getTeams().pipe(
              switchMap((teams) => {
                store.dispatch(setTeams({ teams }));
                return store.select(FromRoot.selectTeams);
              }),
            )
          : of(teams);
      }),
    ),
    store.select(FromRoot.selectCompany),
  ]).pipe(
    map(([{ data: me }, { data: userById }, { data: teamById }, { data: company }]) => ({
      me,
      userById,
      teamById,
      company,
    })),
  );
};
