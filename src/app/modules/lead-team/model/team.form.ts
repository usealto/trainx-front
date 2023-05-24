import { ProgramDtoApi, UserDtoApi } from '@usealto/sdk-ts-angular';

export interface TeamForm {
  longName: string;
  shortName: string;
  invitationEmails: UserDtoApi[];
  programs: ProgramDtoApi[];
}
