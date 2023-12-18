import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Company } from 'src/app/models/company.model';
import { IAppData } from './app.resolver';
import { IHomeData } from './home.resolver';
import { ILeadResolverData } from './lead.resolver';

export enum EResolvers {
  AppResolver = 'appResolver',
  LeadResolver = 'leadResolver',
  CompanyResolver = 'companyResolver',
  HomeResolver = 'homeResolver',
}

export type ResolverData = {
  [key: string]: IAppData | ILeadResolverData | IHomeData | Company;
};

@Injectable()
export class ResolversService {
  getDataFromPathFromRoot(routes: ActivatedRoute[]): ResolverData {
    return routes.reduce((data, route) => {
      return { ...data, ...route.snapshot.data };
    }, {});
  }
}
