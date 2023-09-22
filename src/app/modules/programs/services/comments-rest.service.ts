import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import {
  CommentDtoApi,
  CommentDtoResponseApi,
  CommentsApiService,
  GetCommentsRequestParams,
  PatchCommentDtoApi,
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

  getComments(req?: GetCommentsRequestParams, refresh = false): Observable<CommentDtoApi[]> {
    if (this.programStore.unreadComments.value.length && refresh === false) {
      return this.programStore.unreadComments.value$;
    } else {
      const par = {
        ...req,
        page: req?.page ?? 1,
        itemsPerPage: req?.itemsPerPage ?? 300,
        isRead: req?.isRead ?? false,
      };

      return this.commentApi.getComments(par).pipe(
        map((r) => r.data ?? []),
        tap((comments) => (this.programStore.unreadComments.value = comments.filter((c) => !c.isRead))),
      );
    }
  }
}
