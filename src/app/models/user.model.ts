import { UserDtoApi, UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';

interface IUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  roles: Array<UserDtoApiRolesEnumApi>;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isConnectorActive?: boolean;
}

export class User implements IUser {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  roles: Array<UserDtoApiRolesEnumApi>;
  teamId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isConnectorActive?: boolean;

  constructor(params: UserDtoApi) {
    this.id = params.id;
    this.firstname = params.firstname;
    this.lastname = params.lastname;
    this.email = params.email;
    this.roles = params.roles;
    this.teamId = params.team?.id || '';
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  get fullname(): string {
    return `${this.firstname} ${this.lastname}`;
  }
}
