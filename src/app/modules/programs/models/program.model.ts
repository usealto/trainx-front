import { TeamDtoApi } from 'src/app/sdk';

export interface ProgramFilters {
  teams?: TeamDtoApi[];
  search?: string;
}
