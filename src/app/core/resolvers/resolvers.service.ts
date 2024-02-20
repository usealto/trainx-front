import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAppData } from './app.resolver';
import { ILeadData } from './lead.resolver';
import { IEditProgramData } from './edit-program.resolver';

export enum EResolvers {
  AppResolver = 'appResolver',
  LeadResolver = 'leadResolver',
  EditProgramResolver = 'editProgramResolver',
}

export type ResolverData = {
  [key: string]: IAppData | ILeadData | IEditProgramData;
};

@Injectable()
export class ResolversService {
  getDataFromPathFromRoot(routes: ActivatedRoute[]): ResolverData {
    return routes.reduce((data, route) => {
      return { ...data, ...route.snapshot.data };
    }, {});
  }
}
