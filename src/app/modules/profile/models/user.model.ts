import { Team } from '../../../models/team.model';

export interface UserFilters {
  teams?: Team[];
  score?: string;
  search?: string;
}
