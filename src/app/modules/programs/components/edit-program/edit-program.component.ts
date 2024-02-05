import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EResolvers, ResolversService } from '../../../../core/resolvers/resolvers.service';
import { IEditProgramData } from '../../../../core/resolvers/edit-program.resolver';
import { Program } from '../../../../models/program.model';
import { I18ns, getTranslation } from '../../../../core/utils/i18n/I18n';
import { EmojiName } from '../../../../core/utils/emoji/data';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/services/validation.service';
import { IAppData } from '../../../../core/resolvers';
import { ProgramDtoApiPriorityEnumApi, TagDtoApi } from '@usealto/sdk-ts-angular';
import { ITabOption } from '../../../shared/components/tabs/tabs.component';
import { EColors, PillOption, SelectOption } from '../../../shared/models/select-option.model';
import { Subscription, tap } from 'rxjs';
import { TagsRestService } from '../../services/tags-rest.service';

enum Etab {
  Informations = 'informations',
  Questions = 'questions',
  Summary = 'summary',
}

@Component({
  selector: 'alto-edit-program',
  templateUrl: './edit-program.component.html',
  styleUrls: ['./edit-program.component.scss'],
})
export class EditProgramsComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;
  ETab = Etab;

  private readonly programFormSubscription = new Subscription();

  program?: Program;

  tabsOptions: ITabOption[] = [
    { value: Etab.Informations, label: I18ns.programs.forms.step1.title },
    { value: Etab.Questions, label: I18ns.programs.forms.step2.title },
    { value: Etab.Summary, label: I18ns.programs.forms.step3.title },
  ];
  tabsControl = new FormControl<ITabOption>(this.tabsOptions[0], { nonNullable: true });

  programNames: string[] = [];

  tagOptions: PillOption[] = [];
  tagControls: FormControl<FormControl<PillOption>[]> = new FormControl([], { nonNullable: true });

  teamOptions: PillOption[] = [];
  priorityOptions: SelectOption[] = Object.values(ProgramDtoApiPriorityEnumApi).map(
    (p) =>
      ({
        value: p,
        label: getTranslation(I18ns.shared.priorities, p.toLowerCase()),
      } as SelectOption),
  );

  programFormGroup = new FormGroup({
    nameControl: new FormControl<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        this.validationService.uniqueStringValidation(this.programNames, 'nameNotAllowed'),
      ],
    }),
    expectationControl: new FormControl<number>(75, { nonNullable: true, validators: Validators.required }),
    priorityControl: new FormControl<SelectOption | null>(null, {
      validators: Validators.required,
    }),
    teamControls: new FormControl<FormControl<PillOption>[]>([], { nonNullable: true }),
  });

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly validationService: ValidationService,
    private readonly tagsRestService: TagsRestService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    const company = (data[EResolvers.AppResolver] as IAppData).company;
    this.program = (data[EResolvers.EditProgramResolver] as IEditProgramData).program;
    this.programNames = company.programs.map((p) => p.name);

    this.programFormSubscription.add(
      this.tagsRestService
        .getTags()
        .pipe(
          tap((tags: TagDtoApi[]) => {
            this.tagOptions = tags.map(
              (tag) =>
                ({
                  value: tag.id,
                  label: tag.name,
                  color: EColors.primary,
                } as PillOption),
            );

            this.teamOptions = company.teams.map(
              (team) =>
                ({
                  label: team.name,
                  value: team.id,
                  color: EColors.primary,
                } as PillOption),
            );
          }),
        )
        .subscribe(() => {
          if (this.program) {
            const programTeams = company.teams.filter((team) => this.program?.teamIds.includes(team.id));
            this.programFormGroup.setValue({
              nameControl: this.program.name,
              expectationControl: this.program.expectation,
              priorityControl: {
                value: this.program.priority,
                label: getTranslation(I18ns.shared.priorities, this.program.priority.toLowerCase()),
              } as SelectOption,
              teamControls: programTeams.map(
                (team) =>
                  new FormControl<PillOption>(
                    {
                      value: team.id,
                      label: team.name,
                      color: EColors.primary,
                    } as PillOption,
                    { nonNullable: true },
                  ),
              ),
            });
          }
        }),
    );
  }

  switchTab(option: ITabOption): void {
    this.tabsControl.setValue(option);
  }
}
