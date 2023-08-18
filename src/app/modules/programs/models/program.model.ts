import { TeamDtoApi } from '@usealto/sdk-ts-angular';

export interface ProgramFilters {
  teams?: TeamDtoApi[];
  search?: string;
  score?: string;
  progress?: string;
}
