import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PriorityEnumApi, TagDtoApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { IFormGroup } from 'src/app/core/form-types';
import { EResolvers, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns, getTranslation } from 'src/app/core/utils/i18n/I18n';
import { Team } from 'src/app/models/team.model';
import { IAppData } from '../../../../../core/resolvers';
import { ProgramForm } from '../../../models/programs.form';
import { TagsRestService } from '../../../services/tags-rest.service';
import { ICompany } from '../../../../../models/company.model';

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
  teams: Team[] = [];
  priorities = Object.values(PriorityEnumApi).map((p) => ({
    id: p,
    value: getTranslation(I18ns.shared.priorities, p.toLowerCase()),
  }));
  constructor(
    private readonly tagService: TagsRestService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.teams = (data[EResolvers.AppResolver] as IAppData).company.teams;
    this.tagService
      .getTags()
      .pipe(
        tap((tags) => {
          this.tags = tags ?? [];
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }
}
