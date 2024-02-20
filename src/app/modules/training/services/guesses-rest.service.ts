import { Injectable } from '@angular/core';
import {
  CreateGuessDtoApi,
  GetGuessesRequestParams,
  GuessDtoApi,
  GuessDtoPaginatedResponseApi,
  GuessesApiService,
} from '@usealto/sdk-ts-angular';
import { Observable, map } from 'rxjs';
import { ScoresService } from '../../shared/services/scores.service';
import { addDays } from 'date-fns';
import { EScoreDuration } from '../../../models/score.model';

@Injectable({
  providedIn: 'root',
})
export class GuessesRestService {
  constructor(private readonly guessesApi: GuessesApiService, private readonly scoreService: ScoresService) {}

  getPaginatedGuesses(
    params?: GetGuessesRequestParams,
    duration?: EScoreDuration,
    isProgression?: boolean,
  ): Observable<GuessDtoPaginatedResponseApi> {
    if (duration) {
      const createdAfter = isProgression
        ? this.scoreService.getPreviousPeriod(duration)[0]
        : this.scoreService.getStartDate(duration);
      const createdBefore = isProgression
        ? this.scoreService.getPreviousPeriod(duration)[1]
        : addDays(new Date(), 1); //! TEMPORARY FIX to get data from actual day

      params = {
        ...params,
        createdAfter,
        createdBefore,
      };
    }
    params = {
      ...params,
      itemsPerPage: params?.itemsPerPage || 150,
    };
    return this.guessesApi.getGuesses(params ?? {});
  }

  postGuess(createGuessDtoApi: CreateGuessDtoApi): Observable<GuessDtoApi | undefined> {
    return this.guessesApi.createGuess({ createGuessDtoApi }).pipe(map((r) => r.data));
  }
}
