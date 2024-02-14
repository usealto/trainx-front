import { Injectable } from '@angular/core';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';
import {
  CreateTagDtoApi,
  GetTagsRequestParams,
  PatchTagRequestParams,
  TagDtoApi,
  TagDtoPaginatedResponseApi,
  TagsApiService,
} from '@usealto/sdk-ts-angular';

@Injectable({
  providedIn: 'root',
})
export class TagsRestService {
  constructor(private readonly tagApi: TagsApiService) {}

  getTagsPaginated(req?: GetTagsRequestParams): Observable<TagDtoPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 10,
      sortBy: req?.sortBy ?? 'name:asc',
    };
    return this.tagApi.getTags(par).pipe();
  }

  getAllTags(): Observable<TagDtoApi[]> {
    return this.tagApi.getTags({ page: 1, itemsPerPage: 1000, sortBy: 'name:asc' }).pipe(
      switchMap(({ data, meta }) => {
        const reqs: Observable<TagDtoApi[]>[] = [of(data ? data : [])];
        let totalPages = meta.totalPage ?? 1;

        for (let i = 2; i <= totalPages; i++) {
          reqs.push(
            this.tagApi.getTags({ page: i, itemsPerPage: 1000, sortBy: 'name:asc' }).pipe(
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
      map((tags) => tags.flat()),
    );
  }

  createTag(createTagDtoApi: CreateTagDtoApi): Observable<TagDtoApi | undefined> {
    return this.tagApi.createTag({ createTagDtoApi }).pipe(map((r) => r.data));
  }

  updateTag(patchTagRequestParams: PatchTagRequestParams): Observable<TagDtoApi | undefined> {
    return this.tagApi.patchTag(patchTagRequestParams).pipe(map((r) => r.data));
  }

  deleteTag(id: string) {
    return this.tagApi.deleteTag({ id });
  }
}
