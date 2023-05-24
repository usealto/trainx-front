import { Injectable } from '@angular/core';
import { Store } from 'src/app/core/utils/store/store';
import { UserDtoApi } from '@usealto/sdk-ts-angular';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  // All users
  users: Store<UserDtoApi[]> = new Store<UserDtoApi[]>([]);

  // The connected user
  user: Store<UserDtoApi> = new Store<UserDtoApi>();
}
