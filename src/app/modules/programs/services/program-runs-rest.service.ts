import { Injectable } from '@angular/core';
import {
  CreateProgramRunDtoApi,
  GetAllProgramRunQuestionsPaginatedRequestParams,
  GetProgramRunsRequestParams,
  ProgramRunDtoApi,
  ProgramRunDtoPaginatedResponseApi,
  ProgramRunsApiService,
  QuestionDtoPaginatedResponseApi,
} from '@usealto/sdk-ts-angular';
import { Observable, combineLatest, map, of, switchMap, tap } from 'rxjs';
import { ProgramRun } from '../../../models/program-run.model';

@Injectable({
  providedIn: 'root',
})
export class ProgramRunsRestService {
  constructor(private readonly programRunApi: ProgramRunsApiService) {}

  getProgramRunsPaginated(req: GetProgramRunsRequestParams): Observable<ProgramRunDtoPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 300,
    };

    return this.programRunApi.getProgramRuns(par);
  }

  getAllProgramRuns(req: GetProgramRunsRequestParams): Observable<ProgramRun[]> {
    return this.programRunApi.getProgramRuns(req).pipe(
      switchMap(({ data, meta }) => {
        const reqs: Observable<ProgramRunDtoApi[]>[] = [of(data ? data : [])];
        let totalPages = meta.totalPage ?? 1;

        for (let i = 2; i <= totalPages; i++) {
          reqs.push(
            this.programRunApi.getProgramRuns({ page: i, itemsPerPage: 300, ...req }).pipe(
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
      map((programs) => programs.flat().map((p) => ProgramRun.fromDto(p))),
    );
  }

  getMyProgramRunsQuestions(
    req: GetAllProgramRunQuestionsPaginatedRequestParams,
  ): Observable<QuestionDtoPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 300,
    };

    return this.programRunApi.getAllProgramRunQuestionsPaginated(par);
  }

  create(createProgramRunDtoApi: CreateProgramRunDtoApi) {
    return this.programRunApi.createProgramRun({ createProgramRunDtoApi });
  }
}
