import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgramDtoApi, ProgramRunApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { EResolverData, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Team } from 'src/app/models/team.model';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { AltoRoutes } from '../../constants/routes';

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
  @Input() allTeamsCount: number | undefined;
  @Input() membersHaveValidatedCount!: string | undefined;

  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  EmojiName = EmojiName;

  teamsCount = 0;
  membersHaveValidatedPercentage = 0;

  constructor(
    private readonly programRestService: ProgramsRestService,
    private readonly teamsRestService: TeamsRestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.teamsCount = Array.from((data[EResolverData.TeamsById] as Map<string, Team>).values()).length;

    this.membersHaveValidatedPercentage = this.membersHaveValidatedCount
      ? +this.membersHaveValidatedCount?.split('/')[0] / +this.membersHaveValidatedCount?.split('/')[1]
      : 0;
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
    this.programRestService
      .activate(id, checked)
      .pipe(tap(() => (this.program.isActive = checked)))
      .subscribe();
  }

  teamHover(program: ProgramDtoApi) {
    return program.teams.map((team) => team.name).join(', ');
  }
}
