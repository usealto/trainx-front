import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  CreateQuestionDtoApi,
  GetQuestionsRequestParams,
  PatchQuestionRequestParams,
  QuestionApi,
  QuestionPaginatedResponseApi,
  QuestionsApiService,
} from 'src/app/sdk';

@Injectable({
  providedIn: 'root',
})
export class QuestionsRestService {
  constructor(private readonly questionApi: QuestionsApiService) {}

  getQuestions(req?: GetQuestionsRequestParams): Observable<QuestionApi[]> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 400,
    };

    return this.questionApi.getQuestions(par).pipe(map((r) => r.data ?? []));
  }

  getQuestionsPaginated(req?: GetQuestionsRequestParams): Observable<QuestionPaginatedResponseApi> {
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
