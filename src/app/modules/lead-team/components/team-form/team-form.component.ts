import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import {
  ProgramApi,
  TeamApi,
  UserDtoApi,
  CreateTeamDtoApi,
  PatchTeamDtoApi,
  PatchProgramDtoApi,
} from 'src/app/sdk';
import { TeamForm } from '../../model/team.form';
import { combineLatest, tap } from 'rxjs';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UsersService } from 'src/app/modules/profile/services/users.service';
import { TeamsRestService } from '../../services/teams-rest.service';
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
  users: UserDtoApi[] = [];
  userFilters = { teams: [] as TeamApi[] };

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    readonly fob: UntypedFormBuilder,
    private readonly userRestService: UsersRestService,
    private readonly userService: UsersService,
    private readonly programService: ProgramsRestService,
    private readonly teamsRestService: TeamsRestService,
  ) {
    this.fb = fob;
  }

  ngOnInit(): void {
    setTimeout(() => {
      combineLatest([this.programService.getPrograms(), this.userRestService.getUsers()])
        .pipe(
          tap(([programs, users]) => (this.programs = programs)),
          tap(([programs, users]) => (this.users = users)),
        )
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
        const t = this.team;
        this.programService
          .getPrograms()
          .pipe(
            tap((programs) => {
              this.userFilters.teams.push(t);
              const filteredUsers = this.userService.filterUsers(this.users, this.userFilters);
              this.teamForm.patchValue({
                shortName,
                longName,
                programs: programs.filter((program) => program.teams.some((t) => t.id === this.team?.id)),
                invitationEmails: filteredUsers,
              });
            }),
          )
          .subscribe();
      }
    });
  }
  createTeam() {
    if (!this.teamForm.value) return;

    const { shortName, longName, programs, invitationEmails } = this.teamForm.value;

    if (!this.isEdit && !this.team) {
      //CREATION MODE
      this.teamsRestService
        .createTeam({ shortName, longName })
        .pipe(
          tap((team) => {
            if (team) {
              this.updateTeamInfos(team, programs, invitationEmails);
            }
          }),
          tap((team) => {
            this.createdTag.emit(team);
            this.activeOffcanvas.close();
          }),
        )
        .subscribe();
    } else {
      //EDIT MODE
      const params: PatchTeamDtoApi = {
        shortName: shortName,
        longName: longName,
      };
      this.teamsRestService
        .updateTeam({ id: this.team!.id, patchTeamDtoApi: params })
        .pipe(
          tap((team) => {
            if (team) {
              this.updateTeamInfos(team, programs, invitationEmails);
            }
          }),
          tap((team) => {
            this.createdTag.emit(team);
            this.activeOffcanvas.close();
          }),
        )
        .subscribe();
    }
  }

  updateTeamInfos(team: TeamApi, programs: ProgramApi[], members: UserDtoApi[]) {
    programs.forEach((program) => {
      this.programService.updateProgram(program.id, { teams: [team] }).subscribe();
    });
    members.forEach((member) => {
      this.userRestService.patchUser(member.id, { teamId: team.id }).subscribe();
    });
  }
}
