import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { Program } from '../../../models/program.model';

export interface TeamForm {
  name: string;
  invitationEmails: UserDtoApi[];
  programs: Program[];
}
