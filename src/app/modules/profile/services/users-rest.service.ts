import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { GetUsersRequestParams, UserApi, UsersApiService } from 'src/app/sdk';
import { ProfileStore } from '../profile.store';

@Injectable({
  providedIn: 'root',
})
export class UsersRestService {
  constructor(private readonly userApi: UsersApiService, private userStore: ProfileStore) {}

  getUsers(req?: GetUsersRequestParams): Observable<UserApi[]> {
    return this.userApi.getUsers({ ...req }).pipe(map((r) => r.data ?? []));
  }

  getMe(): Observable<UserApi> {
    return this.userApi.getMe({}).pipe(
      map((u) => u.data || ({} as UserApi)),
      tap((u) => (this.userStore.user.value = u)),
    );
  }
}
