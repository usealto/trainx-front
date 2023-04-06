import { QuestionTypeEnumApi, AnswerFormatTypeEnumApi } from 'src/app/sdk';

export interface QuestionForm {
  title: string;
  type: QuestionTypeEnumApi;
  tags: string[];
  programs: string[];
  answerType: AnswerFormatTypeEnumApi;
  answersAccepted: string;
  /** Change with FormArray when form evolves */
  answersWrong1: string;
  answersWrong2: string;
  answersWrong3: string;
  explanation?: string;
  link?: string;
}
