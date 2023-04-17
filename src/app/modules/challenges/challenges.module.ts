import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChallengesRoutingModule } from './challenges-routing.module';
import { ChallengesComponent } from './components/challenges/challenges.component';
import { SharedModule } from '../shared/shared.module';
import { ChallengeFormComponent } from './components/challenge-form/challenge-form.component';

@NgModule({
  declarations: [ChallengesComponent, ChallengeFormComponent],
  imports: [CommonModule, ChallengesRoutingModule, SharedModule],
})
export class ChallengesModule {}
