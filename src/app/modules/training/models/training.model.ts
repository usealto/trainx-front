import { User } from 'src/app/models/user.model';

export interface TrainingCardData {
  programRunId?: string;
  programId: string;
  title: string;
  score: number;
  expectation: number;
  isProgress: boolean;
  duration?: number;
  updatedAt?: Date;
  users?: User[];
}
