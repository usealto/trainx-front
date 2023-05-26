import { TeamDtoApi } from '@usealto/sdk-ts-angular';

export interface UserFilters {
  teams?: TeamDtoApi[];
  score?: string;
}
