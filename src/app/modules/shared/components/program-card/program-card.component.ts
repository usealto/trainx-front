import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { combineLatest, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { ProgramDtoApi, ProgramRunApi } from '@usealto/sdk-ts-angular';
import { AltoRoutes } from '../../constants/routes';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';

@Component({
  selector: 'alto-program-card',
  templateUrl: './program-card.component.html',
  styleUrls: ['./program-card.component.scss'],
})
export class ProgramCardComponent implements OnInit, OnChanges {
  @Input() displayToggle = false;
  @Input() program!: ProgramDtoApi;
  @Input() programRun!: ProgramRunApi;
  @Input() score: number | undefined;
  @Input() progress: number | undefined;
  @Input() participation: number | undefined;

  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  teamsCount = 0;

  constructor(
    private readonly programRestService: ProgramsRestService,
    private readonly teamsRestService: TeamsRestService,
  ) {}

  ngOnInit(): void {
    this.teamsRestService
      .getTeams()
      .pipe(tap((teams) => (this.teamsCount = teams.length)))
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['programRun']?.firstChange) {
      this.programRestService
        .getProgram(this.programRun.programId)

        .pipe(tap((prog) => (this.program = prog)))
        .subscribe();
    }
  }

  changeIsActive(id: string, checked: boolean) {
    this.programRestService.activate(id, checked).pipe().subscribe();
  }
}
