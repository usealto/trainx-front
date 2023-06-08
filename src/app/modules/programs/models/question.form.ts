import { QuestionTypeEnumApi, AnswerFormatTypeEnumApi } from '@usealto/sdk-ts-angular';

export interface QuestionForm {
  title: string;
  type: QuestionTypeEnumApi;
  tags: string[];
  programs: string[];
  answerType: AnswerFormatTypeEnumApi;
  answersAccepted: string[];
  answersWrong: string[];
  /** Change with FormArray when form evolves */
  // answersWrong1: string;
  // answersWrong2: string;
  // answersWrong3: string;
  explanation?: string;
  link?: string;
}
