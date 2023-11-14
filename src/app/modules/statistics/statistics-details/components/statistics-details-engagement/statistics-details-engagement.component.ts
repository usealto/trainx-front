import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeamDtoApi, UserDtoApi } from '@usealto/sdk-ts-angular';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';

@Component({
  selector: 'alto-statistics-details-engagement',
  templateUrl: './statistics-details-engagement.component.html',
  styleUrls: ['./statistics-details-engagement.component.scss'],
})
export class StatisticsDetailsEngagementComponent implements OnInit {
  team!: TeamDtoApi;
  user!: UserDtoApi;
  type: 'team' | 'user' = 'team';
  constructor(
    private readonly router: Router,
    private readonly teamStore: TeamStore,
    private readonly profileStore: ProfileStore,
  ) {}

  ngOnInit(): void {
    const id = this.router.url.split('/').pop() || '';
    this.type = this.router.url.split('/')[3] === 'team' ? 'team' : 'user';
    if (this.type === 'team') {
      this.team = this.teamStore.teams.value.find((t) => t.id === id) || ({} as TeamDtoApi);
    } else {
      this.user = this.profileStore.users.value.find((u) => u.id === id) || ({} as UserDtoApi);
    }
  }
}
