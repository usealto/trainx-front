import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ProgramDtoApi } from '@usealto/sdk-ts-angular';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';

export const programsResolver: ResolveFn<ProgramDtoApi[]> = () => {
  return inject(ProgramsRestService).getPrograms();
};
