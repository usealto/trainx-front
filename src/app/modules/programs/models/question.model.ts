export interface QuestionDisplay {
  id: string;
  title: string;
  isChecked: boolean;
}
export interface QuestionFilters {
  programs?: string[];
  tags?: string[];
  contributors?: string[];
  search?: string;
}
