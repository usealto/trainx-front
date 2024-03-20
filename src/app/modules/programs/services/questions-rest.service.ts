import { Injectable } from '@angular/core';
import {
  CreateQuestionDtoApi,
  GetQuestionsRequestParams,
  PatchQuestionRequestParams,
  QuestionDtoApi,
  QuestionDtoPaginatedResponseApi,
  QuestionsApiService,
} from '@usealto/sdk-ts-angular';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuestionsRestService {
  constructor(private readonly questionApi: QuestionsApiService) {}

  getQuestionById(id: string): Observable<QuestionDtoApi | undefined> {
    return this.questionApi.getQuestionById({ id: id }).pipe(map((r) => r.data));
  }

  getQuestionsPaginated(req?: GetQuestionsRequestParams): Observable<QuestionDtoPaginatedResponseApi> {
    const par = {
      page: 1,
      itemsPerPage: 25,
      ...req,
    };

    return this.questionApi.getQuestions(par).pipe();
  }

  getProgramQuestionsCount(programId: string) {
    return this.getQuestionsPaginated({ programIds: programId }).pipe(map(({ meta }) => meta.totalItems));
  }

  createQuestion(createQuestionDtoApi: CreateQuestionDtoApi) {
    return this.questionApi.createQuestion({ createQuestionDtoApi }).pipe(map((d) => d.data));
  }

  updateQuestion(patchQuestionRequestParams: PatchQuestionRequestParams) {
    return this.questionApi.patchQuestion(patchQuestionRequestParams).pipe(map((r) => r.data));
  }

  deleteQuestion(id: string) {
    return this.questionApi.deleteQuestion({ id });
  }
}
