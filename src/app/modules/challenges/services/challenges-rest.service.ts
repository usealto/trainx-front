import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ChallengeApi, ChallengesApiService, GetChallengesRequestParams } from 'src/app/sdk';

@Injectable({
  providedIn: 'root',
})
export class ChallengesRestService {
  constructor(private readonly challengeService: ChallengesApiService) {}

  getChallenges(req?: GetChallengesRequestParams): Observable<ChallengeApi[]> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 400,
    };
    // return this.programApi.getPrograms(par).pipe(map((d) => d.data ?? []));
    return this.challengeService.getChallenges(par).pipe(map((d) => d.data ?? []));
  }
}
