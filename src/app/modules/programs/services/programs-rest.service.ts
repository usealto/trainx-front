import { Injectable } from '@angular/core';
import { filter, map, Observable, tap } from 'rxjs';
import {
  CreateProgramDtoApi,
  DeleteResponseApi,
  GetProgramsRequestParams,
  PatchProgramDtoApi,
  ProgramApi,
  ProgramPaginatedResponseApi,
  ProgramResponseApi,
  ProgramsApiService,
} from 'src/app/sdk';
import { ProgramsStore } from '../programs.store';

@Injectable({
  providedIn: 'root',
})
export class ProgramsRestService {
  constructor(
    private readonly programApi: ProgramsApiService,
    private readonly programsStore: ProgramsStore,
  ) {}

  getProgramsPaginated(req: GetProgramsRequestParams): Observable<ProgramPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 300,
    };

    return this.programApi.getPrograms(par);
  }

  updateProgram(id: string, patchProgramDtoApi: PatchProgramDtoApi): Observable<ProgramResponseApi> {
    return this.programApi.patchProgram({ id, patchProgramDtoApi });
  }

  getPrograms(req?: GetProgramsRequestParams): Observable<ProgramApi[]> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 400,
    };
    return this.programApi.getPrograms(par).pipe(
      map((d) => d.data ?? []),
    );
  }

  getProgram(id: string): Observable<ProgramApi> {
    return this.programApi.getProgramById({ id }).pipe(
      filter((p) => !!p.data),
      map((d) => d.data || ({} as ProgramApi)),
    );
  }

  createProgram(createProgramDtoApi: CreateProgramDtoApi) {
    return this.programApi.createProgram({ createProgramDtoApi });
  }

  deleteProgram(id: string): Observable<DeleteResponseApi> {
    return this.programApi.deleteProgram({ id });
  }

  addOrRemoveQuestion(
    programId: string,
    questionId: string,
    toDelete: boolean,
  ): Observable<ProgramResponseApi> {
    if (toDelete) {
      return this.programApi.removeQuestionsFromProgram({
        id: programId,
        altoBaseIdsDtoApi: { ids: [questionId] },
      });
    } else {
      return this.programApi.addQuestionsToProgram({
        id: programId,
        altoBaseIdsDtoApi: { ids: [questionId] },
      });
    }
  }

  activate(id: string, active: boolean) {
    return this.programApi.patchProgram({ id, patchProgramDtoApi: { isActive: active } });
  }
}
