import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChallengesRoutingModule } from './challenges-routing.module';
import { ChallengesComponent } from './components/challenges/challenges.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [ChallengesComponent],
  imports: [CommonModule, ChallengesRoutingModule, SharedModule],
})
export class ChallengesModule {}
