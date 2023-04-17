import { Injectable } from '@angular/core';
import { filter, map, Observable } from 'rxjs';
import {
  ChallengeApi,
  ChallengePaginatedResponseApi,
  ChallengesApiService,
  GetChallengesRequestParams,
} from 'src/app/sdk';

@Injectable({
  providedIn: 'root',
})
export class ChallengesRestService {
  constructor(private readonly challengeService: ChallengesApiService) {}

  getChallenge(id: string): Observable<ChallengeApi> {
    return this.challengeService.getChallengeById({ id }).pipe(
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
    return this.challengeService.getChallenges(par).pipe(map((d) => d.data ?? []));
  }

  getChallengesPaginated(req?: GetChallengesRequestParams): Observable<ChallengePaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 400,
    };
    return this.challengeService.getChallenges(par);
  }
}
