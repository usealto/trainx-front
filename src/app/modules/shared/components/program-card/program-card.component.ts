import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { ScoresRestService } from 'src/app/modules/programs/services/scores-rest.service';
import { GetScoresRequestParams, ProgramApi, ProgramRunApi, ScoreTimeframeEnumApi } from 'src/app/sdk';
import { AltoRoutes } from '../../constants/routes';

@Component({
  selector: 'alto-program-card',
  templateUrl: './program-card.component.html',
  styleUrls: ['./program-card.component.scss'],
})
export class ProgramCardComponent implements OnChanges {
  @Input() displayToggle = false;
  @Input() program!: ProgramApi;
  @Input() programRun!: ProgramRunApi;

  programScore = 0;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  constructor(
    private readonly scoresRestService: ScoresRestService,
    private readonly programRestService: ProgramsRestService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['programRun']?.firstChange) {
      //
      this.programRestService
        .getProgram(this.programRun.programId)
        .pipe(
          tap((prog) => (this.program = prog)),
          tap(() => this.getScores()),
        )
        .subscribe();
    } else if (changes['program']?.firstChange) {
      this.getScores();
    }
  }

  changeIsActive(id: string, checked: boolean) {
    this.programRestService.activate(id, checked).pipe().subscribe();
  }

  getScores() {
    this.scoresRestService
      .getProgramScore({
        timeframe: ScoreTimeframeEnumApi.Year,
        ids: this.program.id,
      } as GetScoresRequestParams)
      .pipe(
        tap((scores) => {
          if (scores.scores[0]) {
            this.programScore = scores.scores[0].averages.reduce((prev, curr) => prev + curr, 0);
          }
        }),
      )
      .subscribe();
  }
}
