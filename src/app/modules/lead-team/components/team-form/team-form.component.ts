import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { PatchProgramDtoApi } from '@usealto/sdk-ts-angular';
import { combineLatest, of, switchMap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { User } from 'src/app/models/user.model';
import { ValidationService } from 'src/app/modules/shared/services/validation.service';
import { Program } from '../../../../models/program.model';
import { Team } from '../../../../models/team.model';
import { ProgramsRestService } from '../../../programs/services/programs-rest.service';
import { PillOption } from '../../../shared/models/select-option.model';
import { TeamsRestService } from '../../services/teams-rest.service';
import { Company } from '../../../../models/company.model';

@Component({
  selector: 'alto-team-form',
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.scss'],
})
export class TeamFormComponent implements OnInit {
  I18ns = I18ns;
  @Input() team?: Team;
  @Input() users: User[] = [];
  @Input() company!: Company;

  @Output() newTeam = new EventEmitter<Team>();

  programOptions: PillOption[] = [];

  teamForm!: FormGroup<{
    nameControl: FormControl<string | null>;
    programsControls: FormControl<FormControl<PillOption>[]>;
  }>;

  get nameControl(): FormControl<string | null> {
    return this.teamForm.controls.nameControl as FormControl<string | null>;
  }

  get programsControls(): FormControl<FormControl<PillOption>[]> {
    return this.teamForm.controls.programsControls as FormControl<FormControl<PillOption>[]>;
  }

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    private readonly validationService: ValidationService,
    private readonly teamsRestService: TeamsRestService,
    private readonly programsRestService: ProgramsRestService,
  ) {}

  ngOnInit(): void {
    this.programOptions = this.company.programs.map(
      (program) => new PillOption({ label: program.name, value: program.id }),
    );

    this.teamForm = new FormGroup({
      nameControl: new FormControl<string | null>(this.team ? this.team.name : null, {
        validators: [
          Validators.required,
          this.validationService.uniqueStringValidation(
            this.company.teams.filter(({ id }) => !this.team || id !== this.team.id).map(({ name }) => name),
            I18ns.leadTeam.teams.duplicateName,
          ),
        ],
      }),
      programsControls: new FormControl<FormControl<PillOption>[]>(
        this.team?.programIds.map((programId) => {
          return new FormControl<PillOption>(
            this.programOptions.find((option) => option.value === programId) as PillOption,
            { nonNullable: true },
          );
        }) ?? [],
        {
          nonNullable: true,
        },
      ),
    });
  }

  submit(): void {
    if (this.teamForm.valid && this.teamForm.dirty) {
      const { nameControl, programsControls } = this.teamForm.controls;

      (this.team
        ? this.teamsRestService.updateTeam({
            id: this.team.id,
            patchTeamDtoApi: { name: nameControl.value as string },
          })
        : this.teamsRestService.createTeam({ name: nameControl.value as string })
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

            if (programIdsToUpdate.length === 0) {
              return combineLatest([of(team)]);
            }

            const $obs = programIdsToUpdate.map((programId) => {
              const program = this.company.programById.get(programId) as Program;

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
}
