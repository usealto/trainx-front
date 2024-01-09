import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IAppData } from 'src/app/core/resolvers';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { Team } from 'src/app/models/team.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'alto-statistics-details-engagement',
  templateUrl: './statistics-details-engagement.component.html',
  styleUrls: ['./statistics-details-engagement.component.scss'],
})
export class StatisticsDetailsEngagementComponent implements OnInit {
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
    const teams = (data[EResolvers.AppResolver] as IAppData).company.teams;

    const id = this.router.url.split('/').pop() || '';
    this.type = this.router.url.split('/')[3] === 'team' ? 'team' : 'user';
    if (this.type === 'team') {
      this.team = teams.find((t) => t.id === id) || ({} as Team);
    } else {
      this.user = users.get(id) || ({} as User);
    }
  }
}
