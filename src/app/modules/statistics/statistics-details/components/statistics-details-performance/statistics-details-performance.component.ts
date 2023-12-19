import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';
import { IAppData } from '../../../../../core/resolvers';

@Component({
  selector: 'alto-statistics-details-performance',
  templateUrl: './statistics-details-performance.component.html',
  styleUrls: ['./statistics-details-performance.component.scss'],
})
export class StatisticsDetailsPerformanceComponent implements OnInit {
  team!: Team;
  user!: User;
  type: 'team' | 'user' = 'team';
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    const users = (data[EResolvers.AppResolver] as IAppData).userById;
    const teams = (data[EResolvers.AppResolver] as IAppData).teamById;

    const id = this.router.url.split('/').pop() || '';
    this.type = this.router.url.split('/')[3] === 'team' ? 'team' : 'user';
    if (this.type === 'team') {
      this.team = teams.get(id) || ({} as Team);
    } else {
      this.user = users.get(id) || ({} as User);
    }
  }
}
