import { RoleEnumApi } from "@usealto/sdk-ts-angular";

export interface UserForm {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  teamId: string;
  roles: Array<RoleEnumApi>;
  slackId: string;
}
