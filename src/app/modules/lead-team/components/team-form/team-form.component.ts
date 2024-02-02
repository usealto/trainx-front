import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { User } from 'src/app/models/user.model';
import { ValidationService } from 'src/app/modules/shared/services/validation.service';
import { Team } from '../../../../models/team.model';
import { Program } from '../../../../models/program.model';
import { SelectOption } from '../../../shared/models/select-option.model';
import { TeamsRestService } from '../../services/teams-rest.service';
import { combineLatest, of, switchMap } from 'rxjs';
import { ProgramsRestService } from '../../../programs/services/programs-rest.service';
import { PatchProgramDtoApi } from '@usealto/sdk-ts-angular';

@Component({
  selector: 'alto-team-form',
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.scss'],
})
export class TeamFormComponent implements OnInit {
  I18ns = I18ns;
  @Input() team?: Team;
  @Input() programs: Program[] = [];
  @Input() teamsNames: string[] = [];
  @Input() users: User[] = [];

  @Output() newTeam = new EventEmitter<Team>();

  programOptions: SelectOption[] = [];

  teamForm = new FormGroup({
    nameControl: new FormControl<string>('', {
      nonNullable: true,
      validators: this.validationService.uniqueStringValidation(this.teamsNames, 'nameNotAllowed'),
    }),
    programsControls: new FormControl<FormControl<SelectOption>[]>([], { nonNullable: true }),
  });

  userFilters = { teams: [] as Team[] };
  teamPrograms: Program[] = [];

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    private readonly validationService: ValidationService,
    private readonly teamsRestService: TeamsRestService,
    private readonly programsRestService: ProgramsRestService,
  ) {}

  ngOnInit(): void {
    this.programOptions = this.programs.map(
      (program) => new SelectOption({ label: program.name, value: program.id }),
    );
    if (this.team) {
      this.teamForm.controls.nameControl.setValue(this.team.name);

      this.teamPrograms = this.programs.filter((program) => program.teamIds.includes(this.team?.id ?? ''));
      const selectedOptionsFormControls = this.programOptions
        .filter((option) => this.teamPrograms.some((p) => p.id === option.value))
        .map((option) => new FormControl(option, { nonNullable: true }));
      this.teamForm.controls.programsControls.setValue(selectedOptionsFormControls);
    }
  }

  submit(): void {
    if (!this.teamForm.valid) return;

    const { nameControl, programsControls } = this.teamForm.controls;

    (this.team
      ? this.teamsRestService.updateTeam({ id: this.team.id, patchTeamDtoApi: { name: nameControl.value } })
      : this.teamsRestService.createTeam({ name: nameControl.value })
    )
      .pipe(
        switchMap((team) => {
          const programIdsToUpdate = [
            ...(programsControls.value.map((progControl) => progControl.value.value) ?? []).filter(
              (id) => !team.programIds.includes(id),
            ),
            ...(team.programIds.filter(
              (id) => !programsControls.value.map((progControl) => progControl.value.value).includes(id),
            ) ?? []),
          ];

          if (programIdsToUpdate.length === 0) return combineLatest([of(team)]);

          const $obs = programIdsToUpdate.map((programId) => {
            const program = this.programs.find((p) => p.id === programId) as Program;

            const newTeamIds = [...program.teamIds];
            if (!newTeamIds.includes(team.id)) {
              newTeamIds.push(team.id);
            } else {
              newTeamIds.splice(newTeamIds.indexOf(team.id), 1);
            }

            return this.programsRestService.updateProgram(programId, {
              teamIds: newTeamIds.map((id) => ({ id: id })),
            } as PatchProgramDtoApi);
          });

          return combineLatest([of(team), ...$obs]);
        }),
      )
      .subscribe({
        next: ([newTeam]) => {
          this.newTeam.emit(newTeam);
          this.activeOffcanvas.close();
        },
        error: () => {
          this.activeOffcanvas.close();
        },
      });
  }
}
