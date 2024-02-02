import { Program } from '../../../models/program.model';

export interface TeamForm {
  name: string;
  programs: Program[];
}
