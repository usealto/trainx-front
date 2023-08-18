export interface QuestionDisplay {
  id: string;
  title: string;
  isChecked: boolean;
}
export interface QuestionFilters {
  duration?: string;
  programs?: string[];
  tags?: string[];
  teams?: string[];
  score?: string;
  search?: string;
}
