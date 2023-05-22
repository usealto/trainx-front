import { RoleEnumApi } from '@usealto/sdk-ts-angular';

export interface UserForm {
  roles?: RoleEnumApi[];
  teamId?: string;
  pref?: object;
  username?: string;
  firstname?: string;
  lastname?: string;
  timezone?: string;
  country?: string;
  pictureUrl?: string;
}
