import { Injectable } from '@angular/core';
import { filter, map, Observable, tap } from 'rxjs';
import {
  CreateProgramDtoApi,
  DeleteResponseApi,
  GetProgramsRequestParams,
  PatchProgramDtoApi,
  ProgramAssignmentPaginatedResponseApi,
  ProgramDtoApi,
  ProgramDtoPaginatedResponseApi,
  ProgramDtoResponseApi,
  ProgramsApiService,
} from 'src/app/sdk';
import { ProgramsStore } from '../programs.store';

@Injectable({
  providedIn: 'root',
})
export class ProgramsRestService {
  constructor(
    private readonly programApi: ProgramsApiService,
    private readonly programStore: ProgramsStore,
  ) {}

  getProgramsPaginated(req: GetProgramsRequestParams): Observable<ProgramDtoPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 300,
    };

    return this.programApi.getPrograms(par);
  }

  updateProgram(id: string, patchProgramDtoApi: PatchProgramDtoApi): Observable<ProgramDtoResponseApi> {
    return this.programApi.patchProgram({ id, patchProgramDtoApi });
  }

  getPrograms(): Observable<ProgramDtoApi[]> {
    if (this.programStore.programs.value.length) {
      return this.programStore.programs.value$;
    } else {
      const par = {
        page: 1,
        itemsPerPage: 400,
      };
      return this.programApi.getPrograms(par).pipe(
        map((d) => d.data ?? []),
        tap((pr) => (this.programStore.programs.value = pr)),
      );
    }
  }

  getProgram(id: string): Observable<ProgramDtoApi> {
    return this.programApi.getProgramById({ id }).pipe(
      filter((p) => !!p.data),
      map((d) => d.data || ({} as ProgramDtoApi)),
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
  ): Observable<ProgramDtoResponseApi> {
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

  getAssignments(ids: string[]): Observable<ProgramAssignmentPaginatedResponseApi> {
    return this.programApi.getAllAssignmentsProgram({
      programIds: ids.join(','),
      itemsPerPage: 200,
      page: 1,
    });
  }

  activate(id: string, active: boolean) {
    return this.programApi.patchProgram({ id, patchProgramDtoApi: { isActive: active } });
  }
}
