import { Injectable } from '@angular/core';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { UserFilters } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  filterUsers(users: UserDtoApi[], { teams }: UserFilters) {
    let output: UserDtoApi[] = [...users];

    if (teams?.length) {
      output = output.filter((u) => teams.some((t) => u.teamId === t.id));
    }

    return output;
  }
}
