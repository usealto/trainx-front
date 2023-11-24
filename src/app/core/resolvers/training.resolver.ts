import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { combineLatest, take } from "rxjs";
import { UsersRestService } from "src/app/modules/profile/services/users-rest.service";

export const trainingResolver: ResolveFn<any> = () => {
  return combineLatest([inject(UsersRestService).getUsers()]).pipe(take(1));
};
