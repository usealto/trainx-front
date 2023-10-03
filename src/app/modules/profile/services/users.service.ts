import { Injectable } from '@angular/core';
import { UserDtoApi, UserStatsDtoApi } from '@usealto/sdk-ts-angular';
import { UserFilters } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  filterUsers<T>(users: UserDtoApi[] | UserStatsDtoApi[], { teams, search }: UserFilters) {
    let output: (UserDtoApi | UserStatsDtoApi)[] = [...users];

    if (teams?.length) {
      output = output.filter((u) => teams.some((t) => u.teamId === t.id));
    }
    if (search) {
      const s = search.toLowerCase();
      output = s.length
        ? output.filter((user) => {
            user = 'user' in user ? user.user : user;
            return user.firstname.toLowerCase().includes(s) || user.lastname.toLowerCase().includes(s);
          })
        : users;
    }

    return output as T;
  }
}
