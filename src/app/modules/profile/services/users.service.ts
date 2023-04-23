import { Injectable } from '@angular/core';
import { UserDtoApi } from 'src/app/sdk';
import { UserFilters } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  filterUsers(users: UserDtoApi[], { teams, status }: UserFilters) {
    let output: UserDtoApi[] = [...users];

    if (teams?.length) {
      output = output.filter((u) => teams.some((t) => u.teamId === t.id));
    }

    if (status !== undefined) {
      status;
      output = output.filter((u) => u.isActive === status);
    }

    return output;
  }
}
