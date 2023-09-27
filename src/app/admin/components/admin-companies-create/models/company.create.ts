import { CreateTeamDtoApi, WeekDayEnumApi } from '@usealto/sdk-ts-angular';

export interface CompanyForm {
  name: string;
  teams: Array<any>;
  newTeams: Array<CreateTeamDtoApi>;
  slackDays?: string[];
  slackQuestionsPerQuiz: number | undefined;
  slackActive?: boolean;
  slackAdmin?: string;
}
