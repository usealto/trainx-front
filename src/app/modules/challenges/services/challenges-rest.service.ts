import { Injectable } from '@angular/core';
import { filter, map, Observable } from 'rxjs';
import {
  ChallengeApi,
  ChallengePaginatedResponseApi,
  ChallengeResponseApi,
  ChallengesApiService,
  CreateChallengeDtoApi,
  GetChallengesRequestParams,
  PatchChallengeDtoApi,
} from 'src/app/sdk';

@Injectable({
  providedIn: 'root',
})
export class ChallengesRestService {
  constructor(private readonly challengeApi: ChallengesApiService) {}

  getChallenge(id: string): Observable<ChallengeApi> {
    return this.challengeApi.getChallengeById({ id }).pipe(
      filter((x) => !!x),
      map((c) => c.data || ({} as ChallengeApi)),
    );
  }

  getChallenges(req?: GetChallengesRequestParams): Observable<ChallengeApi[]> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 400,
    };
    return this.challengeApi.getChallenges(par).pipe(map((d) => d.data ?? []));
  }

  getChallengesPaginated(req?: GetChallengesRequestParams): Observable<ChallengePaginatedResponseApi> {
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

  updateChallenge(id: string, patchChallengeDtoApi: PatchChallengeDtoApi): Observable<ChallengeResponseApi> {
    return this.challengeApi.patchChallenge({ id, patchChallengeDtoApi });
  }
}
