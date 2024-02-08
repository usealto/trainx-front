import { Injectable } from '@angular/core';
import {
  CreateQuestionSubmittedDtoApiStatusEnumApi,
  PatchQuestionSubmittedRequestParams,
  QuestionsSubmittedApiService,
  QuestionSubmittedDtoApi,
  QuestionSubmittedStatusEnumApi,
} from '@usealto/sdk-ts-angular';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuestionsSubmittedRestService {
  constructor(private readonly questionSubmittedApi: QuestionsSubmittedApiService) {}

  getQuestion(id: string): Observable<QuestionSubmittedDtoApi | undefined> {
    return this.questionSubmittedApi.getQuestionSubmittedById({ id }).pipe(map((r) => r.data));
  }

  getAllQuestions(status?: QuestionSubmittedStatusEnumApi): Observable<QuestionSubmittedDtoApi[]> {
    return this.questionSubmittedApi.getQuestionsSubmitted({ page: 1, itemsPerPage: 1000, status }).pipe(
      switchMap(({ data, meta }) => {
        const reqs: Observable<QuestionSubmittedDtoApi[]>[] = [of(data ? data : [])];
        let totalPages = meta.totalPage ?? 1;

        for (let i = 2; i <= totalPages; i++) {
          reqs.push(
            this.questionSubmittedApi.getQuestionsSubmitted({ page: i, itemsPerPage: 1000, status }).pipe(
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
      map((r) => r.flat()),
    );
  }

  update(req: PatchQuestionSubmittedRequestParams) {
    return this.questionSubmittedApi.patchQuestionSubmitted(req);
  }

  create(title: string) {
    return this.questionSubmittedApi.createQuestionSubmitted({
      createQuestionSubmittedDtoApi: { title, status: CreateQuestionSubmittedDtoApiStatusEnumApi.Submitted },
    });
  }
}
