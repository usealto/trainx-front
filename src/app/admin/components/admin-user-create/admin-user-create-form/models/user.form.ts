import { RoleEnumApi } from '@usealto/sdk-ts-angular';

export interface UserForm {
  firstname: string;
  lastname: string;
  email: string;
  roles: Array<RoleEnumApi>;
}
