import { ProgramDtoApi, UserDtoApi } from '@usealto/sdk-ts-angular';

export interface TeamForm {
  longName: string;
  invitationEmails: UserDtoApi[];
  programs: ProgramDtoApi[];
}
