import { Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';
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

  getAllComments(req?: GetCommentsRequestParams): Observable<CommentDtoApi[]> {
    return this.commentApi.getComments({ page: 1, itemsPerPage: 1000, ...req }).pipe(
      switchMap(({ data, meta }) => {
        const reqs: Observable<CommentDtoApi[]>[] = [of(data ? data : [])];
        let totalPages = meta.totalPage ?? 1;

        for (let i = 2; i <= totalPages; i++) {
          reqs.push(
            this.commentApi.getComments({ page: i, itemsPerPage: 1000, ...req }).pipe(
              tap(({ meta }) => {
                if (meta.totalPage !== totalPages) {
                  totalPages = meta.totalPage;
                }
              }),
              map((r) => r.data ?? []),
            ),
          );
        }
        return combineLatest(reqs);
      }),
      map((comments) => comments.flat()),
    );
  }
}
