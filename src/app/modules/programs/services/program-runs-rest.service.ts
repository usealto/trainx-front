import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  CreateProgramRunDtoApi,
  GetProgramRunsRequestParams,
  ProgramRunPaginatedResponseApi,
  ProgramRunsApiService,
} from '@usealto/sdk-ts-angular';
import { ProfileStore } from '../../profile/profile.store';
import { ScoreDuration } from '../../shared/models/score.model';
import { ScoresService } from '../../shared/services/scores.service';

@Injectable({
  providedIn: 'root',
})
export class ProgramRunsRestService {
  constructor(
    private readonly programRunApi: ProgramRunsApiService,
    private readonly profileStore: ProfileStore,
    private readonly scoresService: ScoresService,
  ) {}

  getProgramRunsPaginated(req: GetProgramRunsRequestParams): Observable<ProgramRunPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 300,
    };

    return this.programRunApi.getProgramRuns(par);
  }

  getMyProgramRuns(req?: GetProgramRunsRequestParams, duration?: ScoreDuration, isProgression = false) {
    const params = { ...req, itemsPerPage: 300, createdBy: this.profileStore.user.value.id };
    if (duration) {
      params.createdAfter = isProgression
        ? this.scoresService.getPreviousPeriod(duration)[0]
        : this.scoresService.getStartDate(duration);
      params.createdBefore = isProgression ? this.scoresService.getPreviousPeriod(duration)[1] : new Date();
    }

    return this.programRunApi.getProgramRuns(params).pipe(map((res) => res.data ?? []));
  }

  create(createProgramRunDtoApi: CreateProgramRunDtoApi) {
    return this.programRunApi.createProgramRun({ createProgramRunDtoApi });
  }
}
