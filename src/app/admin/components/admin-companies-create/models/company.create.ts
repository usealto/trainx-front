import { CreateTeamDtoApi } from "src/app/sdk";

export interface CompanyForm {
  name: string;
  domain: string;
  teams: Array<any>;
  newTeams: Array<CreateTeamDtoApi>;
}
