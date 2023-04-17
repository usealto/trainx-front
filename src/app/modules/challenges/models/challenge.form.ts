export interface ChallengeForm {
  name: string;
  type: string;
  teams: string[];
  guessesPerDay: number;
  scoreMinPercent: number;
  startDate: Date;
  endDate: Date;
  reward: string;
}
