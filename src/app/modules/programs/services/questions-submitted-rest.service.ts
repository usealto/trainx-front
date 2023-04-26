import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  GetQuestionsSubmittedRequestParams,
  PatchQuestionSubmittedRequestParams,
  QuestionsSubmittedApiService,
  QuestionSubmittedDtoApi,
  QuestionSubmittedDtoPaginatedResponseApi,
} from 'src/app/sdk';

@Injectable({
  providedIn: 'root',
})
export class QuestionsSubmittedRestService {
  constructor(private readonly questionSubmittedApi: QuestionsSubmittedApiService) {}

  getQuestions(req?: GetQuestionsSubmittedRequestParams): Observable<QuestionSubmittedDtoApi[]> {
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
  ): Observable<QuestionSubmittedDtoPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 10,
      status: 'submitted',
    } as GetQuestionsSubmittedRequestParams;

    return this.questionSubmittedApi.getQuestionsSubmitted(par).pipe();
  }

  update(req: PatchQuestionSubmittedRequestParams) {
    return this.questionSubmittedApi.patchQuestionSubmitted(req);
  }
}
