import { CreateTeamDtoApi, WeekDayEnumApi } from 'src/app/sdk';

export interface CompanyForm {
  name: string;
  domain: string;
  teams: Array<any>;
  newTeams: Array<CreateTeamDtoApi>;
  slackDays?: string[];
  slackQuestionsPerQuiz: number | undefined;
  slackActive?: boolean;
  slackAdmin?: string;
}
