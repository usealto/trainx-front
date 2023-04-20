import { TeamApi } from 'src/app/sdk';

export interface ProgramFilters {
  teams?: TeamApi[];
  search?: string;
}
