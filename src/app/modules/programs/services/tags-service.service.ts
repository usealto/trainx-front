import { Injectable } from '@angular/core';
import { TagDtoApi } from '@usealto/sdk-ts-angular';
import { TagFilters } from '../models/tag.model';

@Injectable({
  providedIn: 'root',
})
export class TagsServiceService {
  filterTags(tags: TagDtoApi[], { programs, contributors, search }: TagFilters) {
    let output: TagDtoApi[] = [...tags];

    if (programs?.length) {
      output = output.filter((t: TagDtoApi) => t.programs.some((p) => programs.some((pr) => pr === p.id)));
    }
    if (contributors?.length) {
      output = output.filter((t: TagDtoApi) => t.createdBy && contributors.includes(t.createdBy));
    }
    if (search) {
      output = output.filter((t: TagDtoApi) => t.name.toLowerCase().includes(search.toLowerCase()));
    }
    return output;
  }
}
