import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Company } from 'src/app/models/company.model';
import { IAppData } from './app.resolver';
import { IHomeData } from './home.resolver';
import { ILeadResolverData } from './lead.resolver';
import { ITeamStatsData } from './teamStats.resolver';
import { IProgramsData } from './programs.resolver';

export enum EResolverData {
  AppData = 'appData',
  HomeData = 'homeData',
  Company = 'company',
  TeamStats = 'teamStats',
  Programs = 'programs'
}

export type ResolverData = {
  [key: string]: IAppData | ILeadResolverData | IHomeData | Company | ITeamStatsData | IProgramsData;
};

@Injectable()
export class ResolversService {
  getDataFromPathFromRoot(routes: ActivatedRoute[]): ResolverData {
    return routes.reduce((data, route) => {
      return { ...data, ...route.snapshot.data };
    }, {});
  }
}
