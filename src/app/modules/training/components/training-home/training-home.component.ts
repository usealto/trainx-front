import { Component, OnInit } from '@angular/core';
import { GetProgramRunsRequestParams } from '@usealto/sdk-ts-angular';
import { combineLatest, map, tap } from 'rxjs';
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
        map(([programs, programRuns]) => {
          return programs.map((p) => {
            const progRun = programRuns.data?.filter((x) => x.programId === p.id)[0] || null;

            return {
              title: p.name,
              score: !progRun ? 0 : (progRun.guessesCount / progRun.questionsCount) * 100,
              updatedAt: progRun?.updatedAt,
              programRunId: progRun?.id,
              programId: p.id,
              isProgress: !progRun?.finishedAt,
              duration: progRun?.guessesCount ? progRun?.guessesCount * 30 : undefined,
            } as TrainingCardData;
          });
        }),
        tap((arr) => {
          this.myPrograms = arr
            .sort((a, b) => (a.updatedAt?.getTime() ?? 0) - (b.updatedAt?.getTime() ?? 0))
            .reverse();
        }),
        tap(console.log),
      )
      .subscribe();
  }

  switchTab(index: number) {
    this.activeTab = index;
  }
}
