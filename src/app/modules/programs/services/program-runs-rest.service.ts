import { Injectable } from '@angular/core';
import {
  CreateProgramRunDtoApi,
  GetAllProgramRunQuestionsPaginatedRequestParams,
  GetProgramRunsRequestParams,
  ProgramRunDtoPaginatedResponseApi,
  ProgramRunsApiService,
  QuestionDtoPaginatedResponseApi,
} from '@usealto/sdk-ts-angular';
import { Observable, map } from 'rxjs';
import { ProgramRun } from '../../../models/program-run.model';
import { UsersRestService } from '../../profile/services/users-rest.service';
import { ScoresService } from '../../shared/services/scores.service';
import { ProgramsRestService } from './programs-rest.service';

@Injectable({
  providedIn: 'root',
})
export class ProgramRunsRestService {
  constructor(
    private readonly programRunApi: ProgramRunsApiService,
    private readonly programsRestService: ProgramsRestService,
    private readonly scoresService: ScoresService,
    private readonly usersService: UsersRestService,
  ) {}

  getProgramRunsPaginated(req: GetProgramRunsRequestParams): Observable<ProgramRunDtoPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 300,
    };

    return this.programRunApi.getProgramRuns(par);
  }

  getUserProgramRuns(userId: string, programIds?: string[]): Observable<ProgramRun[]> {
    return this.getProgramRunsPaginated({
      createdBy: userId,
    } as GetProgramRunsRequestParams).pipe(
      map((programRuns: ProgramRunDtoPaginatedResponseApi) => {
        return (
          programRuns.data
            ?.filter((dto) => programIds?.includes(dto.programId) ?? true)
            .map((dto) => ProgramRun.fromDto(dto)) || []
        );
      }),
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
