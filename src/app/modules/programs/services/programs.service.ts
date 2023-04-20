import { Injectable } from '@angular/core';
import { ProgramApi } from 'src/app/sdk';
import { ProgramFilters } from '../models/program.model';

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  filterPrograms(programs: ProgramApi[], { teams, search }: ProgramFilters) {
    let output: ProgramApi[] = [...programs];

    if (teams?.length) {
      output = output.filter((p) => p.teams.some((t) => teams.some((te) => te.id === t.id)));
    }
    if (search) {
      output = output.filter((p) => p.name.includes(search) || p.description?.includes(search));
    }
    return output;
  }
}
