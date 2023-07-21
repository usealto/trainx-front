import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import {
  CreateTagDtoApi,
  GetTagsRequestParams,
  PatchTagRequestParams,
  TagDtoApi,
  TagDtoPaginatedResponseApi,
  TagsApiService,
} from '@usealto/sdk-ts-angular';
import { ProgramsStore } from '../programs.store';

@Injectable({
  providedIn: 'root',
})
export class TagsRestService {
  constructor(private readonly tagApi: TagsApiService, private readonly programStore: ProgramsStore) {}

  getTags(req?: GetTagsRequestParams): Observable<TagDtoApi[]> {
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

  getTagsPaginated(req?: GetTagsRequestParams): Observable<TagDtoPaginatedResponseApi> {
    const par = {
      ...req,
      page: req?.page ?? 1,
      itemsPerPage: req?.itemsPerPage ?? 10,
      sortBy: req?.sortBy ?? 'name:asc',
    };
    return this.tagApi.getTags(par).pipe();
  }

  createTag(createTagDtoApi: CreateTagDtoApi): Observable<TagDtoApi | undefined> {
    return this.tagApi.createTag({ createTagDtoApi }).pipe(
      map((r) => r.data),
      tap(() => {
        this.programStore.tags.value = [];
      }),
    );
  }

  updateTag(patchTagRequestParams: PatchTagRequestParams): Observable<TagDtoApi | undefined> {
    return this.tagApi.patchTag(patchTagRequestParams).pipe(
      map((r) => r.data),
      tap(() => {
        this.programStore.tags.value = [];
      }),
    );
  }

  deleteTag(id: string) {
    return this.tagApi.deleteTag({ id });
  }
  
  resetTags(){
    this.programStore.tags.reset();
  }
}
