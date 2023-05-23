import { Injectable } from '@angular/core';
import { filter, map, Observable } from 'rxjs';
import {
  ChallengeDtoApi,
  ChallengeDtoPaginatedResponseApi,
  ChallengeDtoResponseApi,
  ChallengesApiService,
  CreateChallengeDtoApi,
  GetChallengesRequestParams,
  PatchChallengeDtoApi,
} from '@usealto/sdk-ts-angular';

@Injectable({
  providedIn: 'root',
})
export class ChallengesRestService {
  constructor(private readonly challengeApi: ChallengesApiService) {}

  getChallenge(id: string): Observable<ChallengeDtoApi> {
    return this.challengeApi.getChallengeById({ id }).pipe(
      filter((x) => !!x),
      map((c) => c.data || ({} as ChallengeDtoApi)),
    );
  }

  getChallenges(req?: GetChallengesRequestParams): Observable<ChallengeDtoApi[]> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 400,
    };
    return this.challengeApi.getChallenges(par).pipe(map((d) => d.data ?? []));
  }

  getChallengesPaginated(req?: GetChallengesRequestParams): Observable<ChallengeDtoPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 400,
    };
    return this.challengeApi.getChallenges(par);
  }

  createChallenge(createChallengeDtoApi: CreateChallengeDtoApi) {
    return this.challengeApi.createChallenge({ createChallengeDtoApi });
  }

  updateChallenge(
    id: string,
    patchChallengeDtoApi: PatchChallengeDtoApi,
  ): Observable<ChallengeDtoResponseApi> {
    return this.challengeApi.patchChallenge({ id, patchChallengeDtoApi });
  }
}
