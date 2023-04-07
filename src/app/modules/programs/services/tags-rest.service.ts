import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import {
  CreateTagDtoApi,
  CreateTagRequestParams,
  GetTagsRequestParams,
  TagApi,
  TagPaginatedResponseApi,
  TagsApiService,
} from 'src/app/sdk';
import { ProgramsStore } from '../programs.store';

@Injectable({
  providedIn: 'root',
})
export class TagsRestService {
  constructor(private readonly tagApi: TagsApiService, private readonly programStore: ProgramsStore) {}

  getTags(req?: GetTagsRequestParams): Observable<TagApi[]> {
    if (this.programStore.tags.value.length) {
      return this.programStore.tags.value$;
    } else {
      const par = {
        ...req,
        page: req?.page ?? 1,
        itemsPerPage: req?.itemsPerPage ?? 300,
        sortBy: req?.sortBy ?? 'name:asc',
      };

      return this.tagApi.getTags(par).pipe(
        map((r) => r.data ?? []),
        tap((tags) => (this.programStore.tags.value = tags)),
      );
    }
  }

  getTagsPaginated(req?: GetTagsRequestParams): Observable<TagPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 10,
      sortBy: req?.sortBy ?? 'name:asc',
    };
    return this.tagApi.getTags(par).pipe();
  }

  createTag(createTagDtoApi: CreateTagDtoApi) {
    return this.tagApi.createTag({ createTagDtoApi }).pipe(map((r) => r.data));
  }
}
