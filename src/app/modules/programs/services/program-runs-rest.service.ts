import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  GetProgramRunsRequestParams,
  ProgramRunPaginatedResponseApi,
  ProgramRunsApiService,
} from 'src/app/sdk';

@Injectable({
  providedIn: 'root',
})
export class ProgramRunsRestService {
  constructor(private readonly programRunApi: ProgramRunsApiService) {}

  getProgramRunsPaginated(req: GetProgramRunsRequestParams): Observable<ProgramRunPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 300,
    };

    return this.programRunApi.getProgramRuns(par);
  }
}
