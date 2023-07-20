import { ProgramDtoApiPriorityEnumApi } from '@usealto/sdk-ts-angular';

export interface ProgramForm {
  name: string;
  description: string;
  expectation: number;
  priority: ProgramDtoApiPriorityEnumApi;
  tags?: string[];
  teams: string[];
}
