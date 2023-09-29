import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import {
  CommentDtoApi,
  CommentDtoPaginatedResponseApi,
  CommentsApiService,
  GetCommentsRequestParams,
  PatchCommentRequestParams,
} from '@usealto/sdk-ts-angular';
import { ProgramsStore } from '../programs.store';

@Injectable({
  providedIn: 'root',
})
export class CommentsRestService {
  constructor(
    private readonly commentApi: CommentsApiService,
    private readonly programStore: ProgramsStore,
  ) {}

  updateComment(req: PatchCommentRequestParams): Observable<CommentDtoApi | undefined> {
    return this.commentApi.patchComment(req).pipe(map((r) => r.data));
  }

  getUnreadComments(req?: GetCommentsRequestParams, refresh = false): Observable<CommentDtoApi[]> {
    if (this.programStore.unreadComments.value.length && refresh === false) {
      return this.programStore.unreadComments.value$;
    } else {
      const par = {
        ...req,
        page: req?.page ?? 1,
        itemsPerPage: req?.itemsPerPage ?? 300,
        isRead: false,
      };

      return this.commentApi.getComments(par).pipe(
        map((r) => r.data ?? []),
        tap((comments) => (this.programStore.unreadComments.value = comments)),
      );
    }
  }

  getCommentsCount(req?: GetCommentsRequestParams): Observable<number> {
    const par = {
      page: 1,
      itemsPerPage: 1,
      ...req,
    } as GetCommentsRequestParams;

    return this.commentApi.getComments(par).pipe(map((r) => r.meta.totalItems ?? 0));
  }

  getCommentsPaginated(req?: GetCommentsRequestParams): Observable<CommentDtoPaginatedResponseApi> {
    const par = {
      page: 1,
      itemsPerPage: 25,
      ...req,
    };

    return this.commentApi.getComments(par);
  }
}
