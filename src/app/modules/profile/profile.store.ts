import { Injectable } from '@angular/core';
import { Store } from 'src/app/core/utils/store/store';
import { UserApi } from 'src/app/sdk';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  // All users
  users: Store<UserApi[]> = new Store<UserApi[]>([]);

  // The connected user
  user: Store<UserApi> = new Store<UserApi>({} as UserApi);
}
