import { Injectable } from '@angular/core';
import {
  CreateProgramDtoApi,
  DeleteResponseApi,
  GetProgramsRequestParams,
  PatchProgramDtoApi,
  ProgramAssignmentDtoPaginatedResponseApi,
  ProgramDtoApi,
  ProgramDtoPaginatedResponseApi,
  ProgramDtoResponseApi,
  ProgramsApiService,
} from '@usealto/sdk-ts-angular';
import { addDays } from 'date-fns';
import { filter, map, Observable, tap } from 'rxjs';
import { Program } from '../../../models/program.model';
import { ScoresService } from '../../shared/services/scores.service';
import { ProgramsStore } from '../programs.store';
import { EScoreDuration } from '../../../models/score.model';

@Injectable({
  providedIn: 'root',
})
export class ProgramsRestService {
  constructor(
    private readonly programApi: ProgramsApiService,
    private readonly programStore: ProgramsStore,
    private readonly scoresService: ScoresService,
  ) {}

  getProgramsPaginated(
    req: GetProgramsRequestParams,
    duration?: EScoreDuration,
    isProgression = false,
  ): Observable<ProgramDtoPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 300,
      sortBy: req?.sortBy ?? 'name:asc',
    } as GetProgramsRequestParams;

    if (duration) {
      par.createdAfter = isProgression
        ? this.scoresService.getPreviousPeriod(duration)[0]
        : this.scoresService.getStartDate(duration);
      par.createdBefore = isProgression
        ? this.scoresService.getPreviousPeriod(duration)[1]
        : addDays(new Date(), 1); //! TEMPORARY FIX to get data from actual day
    }

    return this.programApi.getPrograms(par);
  }

  updateProgram(id: string, patchProgramDtoApi: PatchProgramDtoApi): Observable<ProgramDtoResponseApi> {
    return this.programApi.patchProgram({ id, patchProgramDtoApi }).pipe(
      tap(() => {
        this.programStore.programsInitCardList.reset();
      }),
    );
  }

  // Cloned from getPrograms() to return Program[] and not ProgramDtoApi[]
  getProgramsObj(): Observable<Program[]> {
    const par = {
      page: 1,
      itemsPerPage: 400,
      sortBy: 'name:asc',
    } as GetProgramsRequestParams;

    return this.programApi.getPrograms(par).pipe(
      map((d) => {
        return d.data ? d.data.map((p) => Program.fromDto(p)) : [];
      }),
    );
  }

  getProgram(id: string): Observable<ProgramDtoApi> {
    return this.programApi.getProgramById({ id }).pipe(
      filter((p) => !!p.data),
      map((d) => d.data || ({} as ProgramDtoApi)),
    );
  }

  createProgram(createProgramDtoApi: CreateProgramDtoApi) {
    return this.programApi.createProgram({ createProgramDtoApi }).pipe(
      tap(() => {
        this.programStore.programsInitCardList.reset();
      }),
    );
  }

  deleteProgram(id: string): Observable<DeleteResponseApi> {
    return this.programApi.deleteProgram({ id }).pipe(
      tap(() => {
        this.programStore.programsInitCardList.value = this.programStore.programsInitCardList.value.filter(
          (p) => p.program.id !== id,
        );
      }),
    );
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

  getAssignments(ids: string[]): Observable<ProgramAssignmentDtoPaginatedResponseApi> {
    return this.programApi.getAllAssignmentsProgram({
      programIds: ids.join(','),
      itemsPerPage: 200,
      page: 1,
    });
  }

  activate(id: string, active: boolean): Observable<Program> {
    return this.programApi
      .patchProgram({ id, patchProgramDtoApi: { isActive: active } })
      .pipe(map((p) => Program.fromDto(p.data as ProgramDtoApi)));
  }
}
