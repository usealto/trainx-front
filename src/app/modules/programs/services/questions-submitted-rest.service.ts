import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  CreateQuestionSubmittedDtoApiStatusEnumApi,
  GetQuestionsSubmittedRequestParams,
  GetQuestionSubmittedByIdRequestParams,
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

  create(title: string) {
    return this.questionSubmittedApi.createQuestionSubmitted({
      createQuestionSubmittedDtoApi: { title, status: CreateQuestionSubmittedDtoApiStatusEnumApi.Submitted },
    });
  }
}
