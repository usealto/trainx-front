import { Component, Input, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, tap } from 'rxjs';
import { IFormGroup } from 'src/app/core/form-types';
import { getTranslation, I18ns } from 'src/app/core/utils/i18n/I18n';
import { PriorityEnumApi, TagDtoApi, TeamDtoApi } from '@usealto/sdk-ts-angular';
import { TeamsRestService } from '../../../../lead-team/services/teams-rest.service';
import { ProgramForm } from '../../../models/programs.form';
import { TagsRestService } from '../../../services/tags-rest.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';

@UntilDestroy()
@Component({
  selector: 'alto-programs-form',
  templateUrl: './programs-form.component.html',
  styleUrls: ['./programs-form.component.scss'],
})
export class ProgramsFormComponent implements OnInit {
  @Input() form!: IFormGroup<ProgramForm>;
  @Input() isEdit = false;
  EmojiName = EmojiName;
  I18ns = I18ns;

  tags: TagDtoApi[] = [];
  teams: TeamDtoApi[] = [];
  priorities = Object.values(PriorityEnumApi).map((p) => ({
    id: p,
    value: getTranslation(I18ns.shared.priorities, p.toLowerCase()),
  }));
  constructor(private readonly tagService: TagsRestService, private readonly teamService: TeamsRestService) {}

  ngOnInit(): void {
    combineLatest([this.tagService.getTags(), this.teamService.getTeams()])
      .pipe(
        tap(([tags, teams]) => {
          this.tags = tags ?? [];
          this.teams = teams ?? [];
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }
}
