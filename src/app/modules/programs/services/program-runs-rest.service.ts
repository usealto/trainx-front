import { Injectable } from '@angular/core';
import {
  CreateProgramRunDtoApi,
  GetAllProgramRunQuestionsPaginatedRequestParams,
  GetProgramRunsRequestParams,
  ProgramRunPaginatedResponseApi,
  ProgramRunsApiService,
  QuestionDtoPaginatedResponseApi,
  UserDtoApi,
} from '@usealto/sdk-ts-angular';
import { addDays } from 'date-fns';
import { Observable, combineLatest, map, switchMap, tap } from 'rxjs';
import { ProfileStore } from '../../profile/profile.store';
import { UsersRestService } from '../../profile/services/users-rest.service';
import { ScoreDuration } from '../../shared/models/score.model';
import { ScoresService } from '../../shared/services/scores.service';
import { TrainingCardData } from '../../training/models/training.model';
import { ProgramsRestService } from './programs-rest.service';

@Injectable({
  providedIn: 'root',
})
export class ProgramRunsRestService {
  constructor(
    private readonly programRunApi: ProgramRunsApiService,
    private readonly programsRestService: ProgramsRestService,
    private readonly profileStore: ProfileStore,
    private readonly scoresService: ScoresService,
    private readonly usersService: UsersRestService,
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

          output.push({
            title: p.name,
            score: !progRun ? 0 : (progRun.goodGuessesCount / progRun.questionsCount) * 100,
            updatedAt: progRun?.updatedAt,
            programRunId: progRun?.id,
            programId: p.id,
            expectation: p.expectation,
            isProgress: !progRun?.finishedAt,
            duration: (progRun?.questionsCount ? progRun?.questionsCount : p.questionsCount) * 30,
          });
          return output;
        }, [] as TrainingCardData[]);
      }),
      tap((arr) => {
        myPrograms = arr
          .sort((a, b) => (a.updatedAt?.getTime() ?? 0) - (b.updatedAt?.getTime() ?? 0))
          .reverse();
      }),
      switchMap((arr) =>
        combineLatest([
          this.getProgramRunsPaginated({
            isFinished: true,
            programIds: arr.map((x) => x.programId).join(','),
          }),
          this.usersService.getUsers(),
        ]),
      ),
      map(([prs, users]) => {
        myPrograms = myPrograms.map((pDisp) => ({
          ...pDisp,
          users:
            prs.data?.reduce((result, pr) => {
              const user = users.find((x) => x.id === pr.createdBy);
              if (pr.programId === pDisp.programId && user && !result.find((u) => u.id === user.id)) {
                result.push(user);
              }
              return result;
            }, [] as UserDtoApi[]) ?? [],
        }));
        return myPrograms;
      }),
    );
  }

  getMyProgramRuns(req?: GetProgramRunsRequestParams, duration?: ScoreDuration, isProgression = false) {
    const params = { ...req, itemsPerPage: 300, createdBy: this.profileStore.user.value.id };
    if (duration) {
      params.createdAfter = isProgression
        ? this.scoresService.getPreviousPeriod(duration)[0]
        : this.scoresService.getStartDate(duration);
      params.createdBefore = isProgression
        ? this.scoresService.getPreviousPeriod(duration)[1]
        : addDays(new Date(), 1); //! TEMPORARY FIX to get data from actual day
    }

    return this.programRunApi.getProgramRuns(params).pipe(map((res) => res.data ?? []));
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
