import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  CreateQuestionSubmittedDtoApiStatusEnumApi,
  GetQuestionsSubmittedRequestParams,
  PatchQuestionSubmittedRequestParams,
  QuestionsSubmittedApiService,
  QuestionSubmittedDtoApi,
  QuestionSubmittedDtoPaginatedResponseApi,
} from '@usealto/sdk-ts-angular';

@Injectable({
  providedIn: 'root',
})
export class QuestionsSubmittedRestService {
  constructor(private readonly questionSubmittedApi: QuestionsSubmittedApiService) {}

  getQuestion(id: string): Observable<QuestionSubmittedDtoApi | undefined> {
    return this.questionSubmittedApi.getQuestionSubmittedById({ id }).pipe(map((r) => r.data));
  }

  getQuestionsCount(req?: GetQuestionsSubmittedRequestParams): Observable<number> {
    const par = {
      page: 1,
      itemsPerPage: 1,
      ...req,
    } as GetQuestionsSubmittedRequestParams;

    return this.questionSubmittedApi.getQuestionsSubmitted(par).pipe(map((r) => r.meta.totalItems ?? 0));
  }

  getQuestionsPaginated(
    req?: GetQuestionsSubmittedRequestParams,
  ): Observable<QuestionSubmittedDtoPaginatedResponseApi> {
    const par = {
      page: 1,
      itemsPerPage: 25,
      ...req,
    } as GetQuestionsSubmittedRequestParams;

    return this.questionSubmittedApi.getQuestionsSubmitted(par).pipe();
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
