import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ILeadResolverData } from './lead.resolver';
import { User } from 'src/app/models/user.model';
import { IHomeData } from './home.resolver';
import { Team } from 'src/app/models/team.model';
import { Company } from 'src/app/models/company.model';

export type ResolverData = {
  [key: string]: User | ILeadResolverData | IHomeData | Map<string, User> | Map<string, Team> | Company;
};

@Injectable()
export class ResolversService {
  getDataFromPathFromRoot(routes: ActivatedRoute[]): ResolverData {
    return routes.reduce((data, route) => {
      return { ...data, ...route.snapshot.data };
    }, {});
  }
}
