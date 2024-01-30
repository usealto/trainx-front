import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAppData } from './app.resolver';
import { ILeadData } from './lead.resolver';

export enum EResolvers {
  AppResolver = 'appResolver',
  LeadResolver = 'leadResolver',
}

export type ResolverData = {
  [key: string]: IAppData | ILeadData;
};

@Injectable()
export class ResolversService {
  getDataFromPathFromRoot(routes: ActivatedRoute[]): ResolverData {
    return routes.reduce((data, route) => {
      return { ...data, ...route.snapshot.data };
    }, {});
  }
}
