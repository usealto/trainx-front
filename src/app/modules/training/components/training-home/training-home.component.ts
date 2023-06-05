import { Component, OnInit } from '@angular/core';
import { GetProgramRunsRequestParams } from '@usealto/sdk-ts-angular';
import { combineLatest, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { TrainingCardData } from '../../models/training.model';

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
  user = this.userStore.user.value;

  constructor(
    private readonly programRunsRestService: ProgramRunsRestService,
    private readonly programsRestService: ProgramsRestService,
    private readonly userStore: ProfileStore,
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.programsRestService.getMyPrograms(),
      this.programRunsRestService.getProgramRunsPaginated({
        createdBy: this.user.id,
      } as GetProgramRunsRequestParams),
    ])
      .pipe(
        tap(console.log),
        tap((prs) => {
          // this.onGoingPrograms = progs.filter(p => p.)
        }),
      )
      .subscribe();
  }

  switchTab(index: number) {
    this.activeTab = index;
  }
}
