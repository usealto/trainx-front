import { ProgramDtoApi, UserDtoApi } from '@usealto/sdk-ts-angular';

export interface TeamForm {
  name: string;
  invitationEmails: UserDtoApi[];
  programs: ProgramDtoApi[];
}
