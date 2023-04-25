import { Injectable } from '@angular/core';
import { ProgramDtoApi } from 'src/app/sdk';
import { ProgramFilters } from '../models/program.model';

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  filterPrograms(programs: ProgramDtoApi[], { teams, search }: ProgramFilters) {
    let output: ProgramDtoApi[] = [...programs];

    if (teams?.length) {
      output = output.filter((p) => p.teams.some((t) => teams.some((te) => te.id === t.id)));
    }
    if (search) {
      output = output.filter((p) => p.name.includes(search) || p.description?.includes(search));
    }
    return output;
  }
}
