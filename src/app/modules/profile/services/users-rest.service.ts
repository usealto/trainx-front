import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import {
  GetUsersRequestParams,
  GetScoresRequestParams,
  ScoreDtoApi,
  UserApi,
  UserPaginatedResponseApi,
  UsersApiService,
  ScoresApiService,
} from 'src/app/sdk';
import { ProfileStore } from '../profile.store';

@Injectable({
  providedIn: 'root',
})
export class UsersRestService {
  constructor(
    private readonly scoreApi: ScoresApiService,
    private readonly userApi: UsersApiService,
    private userStore: ProfileStore,
  ) {}

  getUsers(req?: GetUsersRequestParams): Observable<UserApi[]> {
    if (this.userStore.users.value.length) {
      return this.userStore.users.value$;
    } else {
      return this.userApi.getUsers({ ...req }).pipe(
        map((r) => r.data ?? []),
        tap((users) => (this.userStore.users.value = users)),
      );
    }
  }

  getUsersScores(userIds: string[]) {
    const par = {
      type: 'user',
      ids: userIds.join(','),
      timeframe: 'year'
          } as GetScoresRequestParams;
    this.scoreApi.getScores(par);
  }

  getUsersPaginated(req?: GetUsersRequestParams): Observable<UserPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 10,
    };
    return this.userApi.getUsers(par);
  }

  getMe(): Observable<UserApi> {
    return this.userApi.getMe({}).pipe(
      map((u) => u.data || ({} as UserApi)),
      tap((u) => (this.userStore.user.value = u)),
    );
  }

  patchUser(id: string, patchUserDtoApi: Partial<UserApi>): Observable<UserApi> {
    return this.userApi.patchUser({ id, patchUserDtoApi }).pipe(map((u) => u.data || ({} as UserApi)));
  }
}
