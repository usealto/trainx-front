import { Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';
import { CoachDtoApi, CoachsApiService } from '@usealto/sdk-ts-angular';
import { Coach } from 'src/app/models/coach.model';

@Injectable({
  providedIn: 'root',
})
export class CoachsRestService {
  constructor(private readonly coachsApi: CoachsApiService) {}

  getAllCoachs(): Observable<Coach[]> {
    return this.coachsApi.getCoachs({ page: 1, itemsPerPage: 1000, sortBy: 'name:asc' }).pipe(
      switchMap(({ data, meta }) => {
        const reqs: Observable<CoachDtoApi[]>[] = [of(data ? data : [])];
        let totalPages = meta.totalPage ?? 1;

        for (let i = 2; i <= totalPages; i++) {
          reqs.push(
            this.coachsApi.getCoachs({ page: i, itemsPerPage: 1000, sortBy: 'name:asc' }).pipe(
              tap(({ meta }) => {
                if (meta.totalPage !== totalPages) {
                  totalPages = meta.totalPage;
                }
              }),
              map((r) => r.data ?? []),
            ),
          );
        }
        return combineLatest(reqs);
      }),
      map((coachs) => coachs.flat()),
      map((coachs) => coachs.map((coach) => Coach.fromDto(coach))),
    );
  }
}
