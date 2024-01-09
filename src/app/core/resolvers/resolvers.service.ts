import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAppData } from './app.resolver';
import { ITeamStatsData } from './teamStats.resolver';
import { IHomeData } from './home.resolver';

export enum EResolvers {
  AppResolver = 'appResolver',
  LeadResolver = 'leadResolver',
  TeamStats = 'teamStats',
  Programs = 'programs',
  HomeResolver = 'homeResolver',
}

export type ResolverData = {
  [key: string]: IAppData | ITeamStatsData | IHomeData;
};

@Injectable()
export class ResolversService {
  getDataFromPathFromRoot(routes: ActivatedRoute[]): ResolverData {
    return routes.reduce((data, route) => {
      return { ...data, ...route.snapshot.data };
    }, {});
  }
}
