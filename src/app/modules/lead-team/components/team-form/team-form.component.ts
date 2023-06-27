import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { PatchTeamDtoApi, ProgramDtoApi, TeamApi, TeamDtoApi, UserDtoApi } from '@usealto/sdk-ts-angular';
import { Observable, combineLatest, filter, of, switchMap, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { UsersService } from 'src/app/modules/profile/services/users.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { TeamForm } from '../../model/team.form';
import { TeamsRestService } from '../../services/teams-rest.service';
@Component({
  selector: 'alto-team-form',
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.scss'],
})
export class TeamFormComponent implements OnInit {
  I18ns = I18ns;
  @Input() team?: TeamDtoApi;

  private fb: IFormBuilder = this.fob;

  teamForm: IFormGroup<TeamForm> = this.fb.group<TeamForm>({
    shortName: ['', [Validators.required]],
    longName: ['', [Validators.required]],
    programs: [],
    invitationEmails: [],
  });

  isEdit = false;
  programs: ProgramDtoApi[] = [];
  users: UserDtoApi[] = [];
  userFilters = { teams: [] as TeamDtoApi[] };

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    readonly fob: UntypedFormBuilder,
    private readonly userRestService: UsersRestService,
    private readonly userService: UsersService,
    private readonly programService: ProgramsRestService,
    private readonly teamsRestService: TeamsRestService,
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      combineLatest([this.programService.getPrograms(), this.userRestService.getUsers()])
        .pipe(
          tap(([programs, users]) => (this.programs = programs)),
          tap(([programs, users]) => (this.users = users)),
        )
        .subscribe();

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
            this.teamsRestService.resetCache();
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
      if (this.team?.id) {
        this.teamsRestService
          .updateTeam({ id: this.team.id, patchTeamDtoApi: params })
          .pipe(
            filter((team) => !!team),
            switchMap((team) => {
              if (team) {
                this.teamsRestService.resetCache();
                return combineLatest([
                  ...[of(team)],
                  ...this.updateTeamInfos(team, programs, invitationEmails),
                ]);
              }
              return of(null);
            }),
            tap((res) => {
              this.activeOffcanvas.close();
            }),
          )
          .subscribe();
      }
    }
  }

  updateTeamInfos(team: TeamDtoApi, formProgs: ProgramDtoApi[], members: UserDtoApi[]): Observable<any>[] {
    const output: Observable<any>[] = [of(null)];

    const teamProgs = (this.team?.programs || []).reduce((result, program) => {
      const longProg = this.programs.find((po) => program.id === po.id);
      if (longProg && !result.find((p) => p.id === longProg.id)) {
        result.push(longProg);
      }
      return result;
    }, [] as ProgramDtoApi[]);

    teamProgs.forEach((p) => {
      if (!formProgs.find((po) => po.id === p.id)) {
        // To Delete
        output.push(
          this.programService.updateProgram(p.id, {
            teams: p.teams.filter((t) => t.id !== team.id).map((t) => ({ id: t.id } as TeamApi)),
          }),
        );
        this.programService.resetCache();
      }
    });

    formProgs.forEach((p) => {
      if (!teamProgs.find((po) => po.id === p.id) && this.team) {
        // To Add
        output.push(this.programService.updateProgram(p.id, { teams: [...p.teams, this.team] as TeamApi[] }));
        this.programService.resetCache();
      }
    });

    members?.forEach((member) => {
      if (member.teamId !== team.id) {
        output.push(this.userRestService.patchUser(member.id, { teamId: team.id }));
      }
    });

    return output;
  }
}
