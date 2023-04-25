import { TeamDtoApi } from 'src/app/sdk';

export interface UserFilters {
  teams: TeamDtoApi[];
  status?: boolean;
}
