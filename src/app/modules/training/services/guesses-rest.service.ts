import { Injectable } from '@angular/core';
import { GetGuessesRequestParams, GuessDtoApi, GuessesApiService } from '@usealto/sdk-ts-angular';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GuessesRestService {
  constructor(private readonly guessesApi: GuessesApiService) {}

  getGuesses(): Observable<GuessDtoApi[]> {
    return this.guessesApi.getGuesses({} as GetGuessesRequestParams).pipe(map((d) => d.data ?? []));
  }
}
