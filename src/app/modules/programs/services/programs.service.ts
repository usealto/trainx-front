import { Injectable } from '@angular/core';
import { ProgramDtoApi } from '@usealto/sdk-ts-angular';
import { ProgramFilters } from '../models/program.model';
import { Program } from '../../../models/program.model';

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  filterPrograms(programs: Program[], { teams, search }: ProgramFilters) {
    let output: Program[] = [...programs];

    if (teams?.length) {
      output = output.filter((p) => p.teamIds.some((t) => teams.some((te) => te.id === t)));
    }
    if (search) {
      output = output.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return output;
  }
}
