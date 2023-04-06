import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserTeamRoutingModule } from './user-team-routing.module';
import { UserTeamComponent } from './components/user-team/user-team.component';


@NgModule({
  declarations: [
    UserTeamComponent
  ],
  imports: [
    CommonModule,
    UserTeamRoutingModule
  ]
})
export class UserTeamModule { }
