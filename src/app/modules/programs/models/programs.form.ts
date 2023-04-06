import { PriorityEnumApi } from 'src/app/sdk';

export interface ProgramForm {
  name: string;
  description: string;
  expectation: number;
  priority: PriorityEnumApi;
  tags: string[];
  teams: string[];
}
