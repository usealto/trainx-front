import { ProgramDtoApiPriorityEnumApi } from 'src/app/sdk';

export interface ProgramForm {
  name: string;
  description: string;
  expectation: number;
  priority: ProgramDtoApiPriorityEnumApi;
  tags: string[];
  teams: string[];
}
