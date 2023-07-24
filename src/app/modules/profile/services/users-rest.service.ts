import { Injectable } from '@angular/core';
import {
  GetNextQuestionsForUserRequestParams,
  GetScoresRequestParams,
  GetUsersRequestParams,
  PatchUserDtoApi,
  QuestionPaginatedResponseApi,
  ScoresApiService,
  UserDtoApi,
  UserDtoPaginatedResponseApi,
  UsersApiService,
} from '@usealto/sdk-ts-angular';
import { Observable, map, tap } from 'rxjs';
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
      return this.userApi.getUsers({ page: 1, itemsPerPage: 1000 }).pipe(
        map((r) => r.data ?? []),
        tap((users) => (this.userStore.users.value = users)),
      );
    }
  }

  resetUsers() {
    this.userStore.users.value = [];
  }

  getUsersFiltered(req: GetUsersRequestParams): Observable<UserDtoApi[]> {
    return this.userApi.getUsers({ ...req }).pipe(map((r) => r.data ?? []));
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
    if (this.userStore.user.value) {
      return this.userStore.user.value$;
    } else {
      return this.userApi.getMe().pipe(
        map((u) => u.data || ({} as UserDtoApi)),
        tap((u) => (this.userStore.user.value = u)),
      );
    }
  }

  patchUser(id: string, patchUserDtoApi: PatchUserDtoApi): Observable<UserDtoApi> {
    return this.userApi.patchUser({ id, patchUserDtoApi }).pipe(map((u) => u.data || ({} as UserDtoApi)));
  }

  getNextQuestionsPaginated(
    userId: string,
    req?: GetNextQuestionsForUserRequestParams,
  ): Observable<QuestionPaginatedResponseApi> {
    const params = {
      ...req,
      id: userId,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 25,
    } as GetNextQuestionsForUserRequestParams;
    return this.userApi.getNextQuestionsForUser(params).pipe();
  }

  deleteUser(id: string) {
    return this.userApi.deleteUser({ id });
  }
}
