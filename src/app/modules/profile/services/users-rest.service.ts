import { Injectable } from '@angular/core';
import {
  CreateUserDtoApi,
  GetNextQuestionsForUserRequestParams,
  GetScoresRequestParams,
  GetUsersRequestParams,
  NextQuestionDtoPaginatedResponseApi,
  PatchUserDtoApi,
  ScoresApiService,
  UserDtoApi,
  UserDtoPaginatedResponseApi,
  UsersApiService,
} from '@usealto/sdk-ts-angular';
import { Observable, combineLatest, map, of, switchMap, tap } from 'rxjs';
import { User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersRestService {
  constructor(private readonly scoreApi: ScoresApiService, private readonly userApi: UsersApiService) {}

  getUsers(): Observable<User[]> {
    return this.userApi.getUsers({ page: 1, sortBy: 'createdAt:asc', itemsPerPage: 1000 }).pipe(
      switchMap(({ data, meta }) => {
        const reqs: Observable<UserDtoApi[]>[] = [of(data ? data : [])];
        let totalPages = meta.totalPage ?? 1;

        for (let i = 2; i <= totalPages; i++) {
          reqs.push(
            this.userApi.getUsers({ page: i, sortBy: 'createdAt:asc', itemsPerPage: 1000 }).pipe(
              tap(({ meta }) => {
                if (meta.totalPage !== totalPages) {
                  totalPages = meta.totalPage;
                }
              }),
              map(({ data }) => (data ? data : [])),
            ),
          );
        }
        return combineLatest(reqs);
      }),
      map((usersDtos) => {
        return usersDtos.flat().map(User.fromDto);
      }),
    );
  }

  getUsersCount(params: GetUsersRequestParams): Observable<number> {
    return this.userApi.getUsers({ ...params, itemsPerPage: 1 }).pipe(map((r) => r.meta.totalItems ?? 0));
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

  getMe(): Observable<User | undefined> {
    return this.userApi.getMe().pipe(map(({ data }) => (data ? User.fromDto(data) : undefined)));
  }

  patchUser(id: string, patchUserDtoApi: PatchUserDtoApi): Observable<User> {
    return this.userApi
      .patchUser({ id, patchUserDtoApi })
      .pipe(map(({ data: user }) => User.fromDto(user as UserDtoApi)));
  }

  getNextQuestionsPaginated(
    userId: string,
    req?: GetNextQuestionsForUserRequestParams,
  ): Observable<NextQuestionDtoPaginatedResponseApi> {
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

  createUser(user: CreateUserDtoApi) {
    return this.userApi.createUser({ createUserDtoApi: user });
  }
}
