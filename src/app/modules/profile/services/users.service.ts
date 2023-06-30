import { Injectable } from '@angular/core';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { UserFilters } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  filterUsers(users: UserDtoApi[], { teams, search }: UserFilters) {
    let output: UserDtoApi[] = [...users];

    if (teams?.length) {
      output = output.filter((u) => teams.some((t) => u.teamId === t.id));
    }
    if (search) {
      const s = search.toLowerCase();
      output = s.length
        ? output.filter(
            (user) => user.firstname?.toLowerCase().includes(s) || user.lastname?.toLowerCase().includes(s),
          )
        : users;
    }

    return output;
  }
}
