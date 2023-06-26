import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  CreateQuestionDtoApi,
  GetQuestionsRequestParams,
  PatchQuestionRequestParams,
  QuestionDtoApi,
  QuestionDtoPaginatedResponseApi,
  QuestionsApiService,
} from '@usealto/sdk-ts-angular';

@Injectable({
  providedIn: 'root',
})
export class QuestionsRestService {
  constructor(private readonly questionApi: QuestionsApiService) {}

  getQuestions(req?: GetQuestionsRequestParams): Observable<QuestionDtoApi[]> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 600,
    };

    return this.questionApi.getQuestions(par).pipe(map((r) => r.data ?? []));
  }

  getQuestionsPaginated(req?: GetQuestionsRequestParams): Observable<QuestionDtoPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 25,
    };

    return this.questionApi.getQuestions(par).pipe();
  }

  createQuestion(createQuestionDtoApi: CreateQuestionDtoApi) {
    return this.questionApi.createQuestion({ createQuestionDtoApi }).pipe(map((d) => d.data));
  }

  updateQuestion(patchQuestionRequestParams: PatchQuestionRequestParams) {
    return this.questionApi.patchQuestion(patchQuestionRequestParams).pipe(map((r) => r.data));
  }
}
