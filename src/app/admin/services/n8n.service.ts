import { Injectable } from '@angular/core';
import { N8nApiService, UpdateSlackIdDtoApi } from '@usealto/sdk-ts-angular';

@Injectable({
  providedIn: 'root',
})
export class N8nService {
  constructor(private readonly n8nApi: N8nApiService) {}

  updateSlackId(updateSlackIdDtoApi: UpdateSlackIdDtoApi) {
    return this.n8nApi.n8nProxyControllerUpdateSlackIdPost({ updateSlackIdDtoApi });
  }
}
