import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import {
  GetScoresRequestParams,
  GetUsersRequestParams,
  PatchUserDtoApi,
  ScoresApiService,
  UserDtoApi,
  UserDtoPaginatedResponseApi,
  UsersApiService,
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

  getUsers(): Observable<UserDtoApi[]> {
    if (this.userStore.users.value.length) {
      return this.userStore.users.value$;
    } else {
      return this.userApi.getUsers({}).pipe(
        map((r) => r.data ?? []),
        tap((users) => (this.userStore.users.value = users)),
      );
    }
  }

  getUsersFiltered(req: GetUsersRequestParams): Observable<UserDtoApi[]> {
    return this.userApi.getUsers({ ...req }).pipe(
      map((r) => r.data ?? []),
      tap((users) => (this.userStore.users.value = users)),
    );
  }

  getUsersScores(userIds: string[]) {
    const par = {
      type: 'user',
      ids: userIds.join(','),
      timeframe: 'year',
    } as GetScoresRequestParams;
    this.scoreApi.getScores(par);
  }

  getUsersPaginated(req?: GetUsersRequestParams): Observable<UserDtoPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 10,
    };
    return this.userApi.getUsers(par);
  }

  getMe(): Observable<UserDtoApi> {
    return this.userApi.getMe({}).pipe(
      map((u) => u.data || ({} as UserDtoApi)),
      tap((u) => (this.userStore.user.value = u)),
    );
  }

  patchUser(id: string, patchUserDtoApi: PatchUserDtoApi): Observable<UserDtoApi> {
    return this.userApi.patchUser({ id, patchUserDtoApi }).pipe(map((u) => u.data || ({} as UserDtoApi)));
  }
}
