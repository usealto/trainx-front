// export interface QuestionRequestDto extends RequestDto {
//   tagIds?: string[];
//   programRunIds?: string[];
//   isProgramRunQuestionDone?: boolean;
//   sortByProgramId?: string;
//   search?: string;
// }
export interface QuestionDisplay {
  id: string;
  title: string;
  isChecked: boolean;
}
