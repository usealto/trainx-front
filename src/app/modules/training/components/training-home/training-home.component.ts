import { Component, OnInit } from '@angular/core';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { TrainingCardData } from '../../models/training.model';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'alto-training-home',
  templateUrl: './training-home.component.html',
  styleUrls: ['./training-home.component.scss'],
})
export class TrainingHomeComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  activeTab = 1;

  guessesCount = 0;

  myPrograms: TrainingCardData[] = [];
  onGoingPrograms?: TrainingCardData[];
  improveScorePrograms?: any[];
  user = this.userStore.user.value;

  constructor(
    private readonly programRunsRestService: ProgramRunsRestService,
    private readonly userStore: ProfileStore,
  ) {}

  ngOnInit(): void {
    this.programRunsRestService
      .getMyProgramRunsCards()
      .pipe(
        tap((a) => {
          this.myPrograms = a;
          this.onGoingPrograms = a.filter((r) => r.isProgress === true);
        }),
      )
      .subscribe();

    this.programRunsRestService
      .getMyProgramRunsCards()
      .pipe(
        tap((a) => {
          this.improveScorePrograms = a.filter((r) => r.isProgress !== true);
        }),
      )
      .subscribe();
  }

  switchTab(index: number) {
    this.activeTab = index;
  }

  onGoingFilter(val: string) {
    switch (val) {
      case '1':
        this.onGoingPrograms = this.myPrograms;
        break;
      case '2':
        this.onGoingPrograms = this.myPrograms.filter((p) => !!p.programRunId);
        break;
      case '3':
        this.onGoingPrograms = this.myPrograms.filter((p) => !p.programRunId);
        break;
    }
  }

  @memoize()
  getUser(id: string): UserDtoApi | undefined {
    return this.userStore.users.value.find((x) => x.id === id);
  }
}
