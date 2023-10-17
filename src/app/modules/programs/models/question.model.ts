import { QuestionDtoApi } from '@usealto/sdk-ts-angular';

export interface QuestionDisplayLight {
  id: string;
  title: string;
  isChecked: boolean;
}
export interface QuestionDisplay extends QuestionDtoApi {
  score?: number;
}
export interface QuestionFilters {
  duration?: string;
  programs?: string[];
  tags?: string[];
  teams?: string[];
  score?: string;
  search?: string;
}
