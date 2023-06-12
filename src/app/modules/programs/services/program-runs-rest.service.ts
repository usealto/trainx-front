import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, switchMap, tap } from 'rxjs';
import {
  GetProgramRunsRequestParams,
  ProgramRunPaginatedResponseApi,
  ProgramRunsApiService,
  UserDtoApi,
} from '@usealto/sdk-ts-angular';
import { ProgramsRestService } from './programs-rest.service';
import { TrainingCardData } from '../../training/models/training.model';
import { ProfileStore } from '../../profile/profile.store';

@Injectable({
  providedIn: 'root',
})
export class ProgramRunsRestService {
  constructor(
    private readonly programRunApi: ProgramRunsApiService,
    private readonly programsRestService: ProgramsRestService,
    private readonly profileStore: ProfileStore,
  ) {}

  getProgramRunsPaginated(req: GetProgramRunsRequestParams): Observable<ProgramRunPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 300,
    };

    return this.programRunApi.getProgramRuns(par);
  }

  getMyProgramRunsCards(): Observable<TrainingCardData[]> {
    let myPrograms: TrainingCardData[] = [];
    return combineLatest([
      this.programsRestService.getMyPrograms(),
      this.getProgramRunsPaginated({
        createdBy: this.profileStore.user.value.id,
      } as GetProgramRunsRequestParams),
    ]).pipe(
      map(([programs, programRuns]) => {
        return programs.reduce((output, p) => {
          const progRun = programRuns.data?.filter((x) => x.programId === p.id)[0] || null;

          if (!progRun?.finishedAt) {
            output.push({
              title: p.name,
              score: !progRun ? 0 : (progRun.guessesCount / progRun.questionsCount) * 100,
              updatedAt: progRun?.updatedAt,
              programRunId: progRun?.id,
              programId: p.id,
              isProgress: !progRun?.finishedAt,
              duration: progRun?.questionsCount ? progRun?.questionsCount * 30 : undefined,
            });
          }
          return output;
        }, [] as TrainingCardData[]);
      }),
      tap((arr) => {
        myPrograms = arr
          .sort((a, b) => (a.updatedAt?.getTime() ?? 0) - (b.updatedAt?.getTime() ?? 0))
          .reverse();
      }),
      switchMap((arr) =>
        this.getProgramRunsPaginated({
          isFinished: true,
          programIds: arr.map((x) => x.programId).join(','),
        }),
      ),
      map((prs) => {
        myPrograms = myPrograms.map((pDisp) => ({
          ...pDisp,
          users:
            prs.data?.reduce((result, pr) => {
              const user = this.profileStore.users.value.find((x) => x.id === pr.createdBy);
              if (pr.programId === pDisp.programId && user && !result.find((u) => u.id === user.id)) {
                // if (user && !result.find((u) => u.id === user.id)) {
                result.push(user);
              }
              return result;
            }, [] as UserDtoApi[]) ?? [],
        }));
        return myPrograms;
      }),
      tap(console.log),
    );
  }
}
