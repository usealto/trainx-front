import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProgramApi, TeamApi } from 'src/app/sdk';
import { TeamForm } from '../../model/team.form';
import { combineLatest, tap } from 'rxjs';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';

@Component({
  selector: 'alto-team-form',
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.scss'],
})
export class TeamFormComponent implements OnInit {
  I18ns = I18ns;
  @Input() team?: TeamApi;
  @Output() createdTag = new EventEmitter<TeamApi>();
  private fb: IFormBuilder;
  teamForm!: IFormGroup<TeamForm>;
  isEdit = false;
  programs: ProgramApi[] = [];

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    readonly fob: UntypedFormBuilder,
    private readonly programService: ProgramsRestService,
  ) {
    this.fb = fob;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.programService
        .getPrograms()
        .pipe(tap((programs) => (this.programs = programs ?? [])))
        .subscribe();
      this.teamForm = this.fb.group<TeamForm>({
        shortName: ['', [Validators.required]],
        longName: ['', [Validators.required]],
        programs: [],
        invitationEmails: [],
      });
      if (this.team) {
        this.isEdit = true;
        const { shortName, longName } = this.team;
        this.programService
          .getPrograms()
          .pipe(
            tap((programs) => {
              this.teamForm.patchValue({
                shortName,
                longName,
                programs: programs
                  .filter((program) => program.teams.some((t) => t.id === this.team?.id))
                  .map((p) => p.id),
              });
            }),
          )
          .subscribe();
      }
    });
  }
  createTeam() {
    return;
  }
}
