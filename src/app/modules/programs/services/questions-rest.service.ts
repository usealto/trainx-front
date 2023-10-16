import { Injectable } from '@angular/core';
import {
  CreateQuestionDtoApi,
  GetQuestionsRequestParams,
  PatchQuestionRequestParams,
  QuestionDtoApi,
  QuestionDtoPaginatedResponseApi,
  QuestionsApiService,
} from '@usealto/sdk-ts-angular';
import { map, Observable, tap } from 'rxjs';
import { ProgramsStore } from '../programs.store';

@Injectable({
  providedIn: 'root',
})
export class QuestionsRestService {
  constructor(
    private readonly questionApi: QuestionsApiService,
    private readonly programStore: ProgramsStore,
  ) {}

  getQuestion(id: string): Observable<QuestionDtoApi | undefined> {
    return this.questionApi.getQuestionById({ id: id }).pipe(map((r) => r.data));
  }

  getQuestions(req?: GetQuestionsRequestParams): Observable<QuestionDtoApi[]> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 800,
    };

    return this.questionApi.getQuestions(par).pipe(map((r) => r.data ?? []));
  }

  getQuestionById(id: string): Observable<QuestionDtoApi | null> {
    return this.questionApi.getQuestionById({ id }).pipe(map((r) => r.data ?? null));
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
    return this.questionApi.createQuestion({ createQuestionDtoApi }).pipe(
      map((d) => d.data),
      tap((q) => this.programStore.questionsInitList.add(q)),
    );
  }

  updateQuestion(patchQuestionRequestParams: PatchQuestionRequestParams) {
    return this.questionApi.patchQuestion(patchQuestionRequestParams).pipe(map((r) => r.data));
  }

  deleteQuestion(id: string) {
    return this.questionApi.deleteQuestion({ id }).pipe(
      tap(() => {
        this.programStore.questionsInitList.value = this.programStore.questionsInitList.value.filter(
          (p) => p.id !== id,
        );
      }),
    );
  }
}
