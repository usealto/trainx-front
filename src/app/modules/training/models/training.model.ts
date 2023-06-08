import { UserDtoApi } from '@usealto/sdk-ts-angular';

export interface TrainingCardData {
  programRunId?: string;
  programId?: string;
  title: string;
  score: number;
  isProgress: boolean;
  duration?: number;
  updatedAt?: Date;
  users?: UserDtoApi[];
}
