import { Injectable } from '@angular/core';
import { UserApi } from 'src/app/sdk';
import { UserFilters } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  filterUsers(users: UserApi[], { teams }: UserFilters) {
    let output: UserApi[] = [...users];

    if (teams?.length) {
      output = output.filter((u) => teams.some((t) => u.teamId === t.id));
    }

    return output;
  }
}
