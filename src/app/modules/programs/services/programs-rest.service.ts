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
import { Observable, combineLatest, filter, map, of, switchMap, tap } from 'rxjs';
import { Program } from '../../../models/program.model';
import { EScoreDuration } from '../../../models/score.model';
import { ScoresService } from '../../shared/services/scores.service';

@Injectable({
  providedIn: 'root',
})
export class ProgramsRestService {
  constructor(
    private readonly programApi: ProgramsApiService,
    private readonly scoresService: ScoresService,
  ) {}

  getProgramsPaginated(
    req: GetProgramsRequestParams,
    duration?: EScoreDuration,
    isProgression = false,
  ): Observable<ProgramDtoPaginatedResponseApi> {
    const par = {
      page: 1,
      itemsPerPage: 300,
      sortBy: 'name:asc',
      ...req,
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

  getAllPrograms(req?: GetProgramsRequestParams): Observable<Program[]> {
    return this.programApi.getPrograms({ page: 1, itemsPerPage: 400, sortBy: 'name:asc', ...req }).pipe(
      switchMap(({ data, meta }) => {
        const reqs: Observable<ProgramDtoApi[]>[] = [of(data ? data : [])];
        let totalPages = meta.totalPage ?? 1;

        for (let i = 2; i <= totalPages; i++) {
          reqs.push(
            this.programApi.getPrograms({ page: i, itemsPerPage: 400, sortBy: 'name:asc', ...req }).pipe(
              tap(({ meta }) => {
                if (meta.totalPage !== totalPages) {
                  totalPages = meta.totalPage;
                }
              }),
              map((r) => r.data ?? []),
            ),
          );
        }
        return combineLatest(reqs);
      }),
      map((programs) => programs.flat().map((p) => Program.fromDto(p))),
    );
  }

  createProgram(createProgramDtoApi: CreateProgramDtoApi) {
    return this.programApi
      .createProgram({ createProgramDtoApi })
      .pipe(map(({ data }) => Program.fromDto(data as ProgramDtoApi)));
  }

  updateProgram(id: string, patchProgramDtoApi: PatchProgramDtoApi): Observable<Program> {
    return this.programApi
      .patchProgram({ id, patchProgramDtoApi })
      .pipe(map(({ data }) => Program.fromDto(data as ProgramDtoApi)));
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

  addQuestionToProgram(programId: string, questionId: string): Observable<ProgramDtoResponseApi> {
    return this.programApi.addQuestionsToProgram({ id: programId, altoBaseIdsDtoApi: { ids: [questionId] } });
  }

  removeQuestionFromProgram(programId: string, questionId: string): Observable<ProgramDtoResponseApi> {
    return this.programApi.removeQuestionsFromProgram({
      id: programId,
      altoBaseIdsDtoApi: { ids: [questionId] },
    });
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
