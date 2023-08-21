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
} from '@usealto/sdk-ts-angular';
import { ProgramsStore } from '../programs.store';
import { ProfileStore } from '../../profile/profile.store';
import { ScoreDuration } from '../../shared/models/score.model';
import { ScoresService } from '../../shared/services/scores.service';
import { addDays } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class ProgramsRestService {
  constructor(
    private readonly programApi: ProgramsApiService,
    private readonly programStore: ProgramsStore,
    private readonly profileStore: ProfileStore,
    private readonly scoresService: ScoresService,
  ) {}

  getProgramsPaginated(
    req: GetProgramsRequestParams,
    duration?: ScoreDuration,
    isProgression = false,
  ): Observable<ProgramDtoPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 300,
    } as GetProgramsRequestParams;

    if (duration) {
      par.createdAfter = isProgression
        ? this.scoresService.getPreviousPeriod(duration)[0]
        : this.scoresService.getStartDate(duration);
      par.createdBefore = isProgression ? this.scoresService.getPreviousPeriod(duration)[1] : addDays(new Date(), 1); //! TEMPORARY FIX to get data from actual day
    }

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
      } as GetProgramsRequestParams;

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

  getMyPrograms(): Observable<ProgramDtoApi[]> {
    if (this.profileStore.myPrograms.value.length > 0) {
      return this.profileStore.myPrograms.value$;
    } else {
      return this.getPrograms().pipe(
        map((ps: ProgramDtoApi[]) =>
          ps.filter((p) => p.teams.some((t) => t && t.id === this.profileStore.user.value.teamId)),
        ),
        tap((p) => (this.profileStore.myPrograms.value = p)),
      );
    }
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

  resetCache() {
    this.programStore.programs.reset();
  }
}
