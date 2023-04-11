import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { GetUsersRequestParams, UserApi, UserPaginatedResponseApi, UsersApiService } from 'src/app/sdk';
import { ProfileStore } from '../profile.store';

@Injectable({
  providedIn: 'root',
})
export class UsersRestService {
  constructor(private readonly userApi: UsersApiService, private userStore: ProfileStore) {}

  getUsers(req?: GetUsersRequestParams): Observable<UserApi[]> {
    return this.userApi.getUsers({ ...req }).pipe(map((r) => r.data ?? []));
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
