import { RoleEnumApi, TeamLightDtoApi } from '@usealto/sdk-ts-angular';

export interface UserForm {
  firstname: string;
  lastname: string;
  email: string;
  roles: Array<RoleEnumApi>;
  team?: TeamLightDtoApi;
}

export interface UserFormView {
  firstname: string;
  lastname: string;
  teamId: string;
  email: string;
  roles: Array<RoleEnumApi>;
}
