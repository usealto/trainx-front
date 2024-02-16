import { Injectable } from '@angular/core';
import {
  CommentDtoApi,
  CommentsApiService,
  GetCommentsRequestParams,
  PatchCommentRequestParams,
} from '@usealto/sdk-ts-angular';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommentsRestService {
  constructor(private readonly commentApi: CommentsApiService) {}

  updateComment(req: PatchCommentRequestParams): Observable<CommentDtoApi | undefined> {
    return this.commentApi.patchComment(req).pipe(map((r) => r.data));
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
