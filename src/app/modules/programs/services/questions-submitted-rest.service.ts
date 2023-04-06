import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import {
  GetQuestionsSubmittedRequestParams,
  QuestionsSubmittedApiService,
  QuestionSubmittedApi,
  QuestionSubmittedPaginatedResponseApi,
} from 'src/app/sdk';

@Injectable({
  providedIn: 'root',
})
export class QuestionsSubmittedRestService {
  constructor(private readonly questionSubmittedApi: QuestionsSubmittedApiService) {}

  getQuestions(req?: GetQuestionsSubmittedRequestParams): Observable<QuestionSubmittedApi[]> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 300,
      status: 'submitted',
    } as GetQuestionsSubmittedRequestParams;

    return this.questionSubmittedApi.getQuestionsSubmitted(par).pipe(map((r) => r.data ?? []));
  }

  getQuestionsPaginated(
    req?: GetQuestionsSubmittedRequestParams,
  ): Observable<QuestionSubmittedPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 10,
      status: 'submitted',
    } as GetQuestionsSubmittedRequestParams;

    return this.questionSubmittedApi.getQuestionsSubmitted(par).pipe();
  }
}
