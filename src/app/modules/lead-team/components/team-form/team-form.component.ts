import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { PatchTeamDtoApi, ProgramDtoApi, TeamDtoApi, UserDtoApi } from '@usealto/sdk-ts-angular';
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
  @Output() teamChanged?: EventEmitter<TeamDtoApi> = new EventEmitter<TeamDtoApi>();

  private fb: IFormBuilder = this.fob;

  teamsNames: string[] = [];

  teamForm: IFormGroup<TeamForm> = this.fb.group<TeamForm>({
    name: ['', [Validators.required, this.uniqueNameValidation(this.teamsNames)]],
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
    this.teamsRestService
      .getTeams()
      .pipe(
        tap((d) => {
          d.forEach((t) => {
            this.teamsNames.push(t.name.toLowerCase());
          });
        }),
        tap(() => {
          const teamName = this.team?.name.toLowerCase();
          const index = this.teamsNames.indexOf(teamName ?? '');
          this.teamsNames.splice(index, 1);
        }),
      )
      .subscribe();

    setTimeout(() => {
      combineLatest([this.programService.getPrograms(), this.userRestService.getUsers()])
        .pipe(
          tap(([programs, users]) => (this.programs = programs)),
          tap(([programs, users]) => (this.users = users)),
        )
        .subscribe();

      if (this.team) {
        this.teamsRestService
          .getTeam(this.team.id)
          .pipe(
            tap((d) => {
              if (!d.data) {
                return;
              }
              this.team = d.data;
              this.isEdit = true;
              const { name, programs } = this.team;
              this.userFilters.teams.push(this.team);
              const filteredUsers = this.userService.filterUsers<UserDtoApi[]>(this.users, this.userFilters);

              this.teamForm.patchValue({
                name,
                programs: programs as ProgramDtoApi[],
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

    const { name, programs, invitationEmails } = this.teamForm.value;

    if (!this.isEdit && !this.team) {
      //CREATION MODE
      this.teamsRestService
        .createTeam({ name })
        .pipe(
          switchMap((team) => {
            this.teamsRestService.resetCache();
            if (team) {
              return combineLatest(this.updateTeamInfos(team, programs, invitationEmails));
            }
            return of(null);
          }),
          tap(() => {
            this.teamsRestService.resetCache();
            this.teamChanged?.emit();
            this.activeOffcanvas.dismiss();
          }),
        )
        .subscribe();
    } else {
      //EDIT MODE
      const params: PatchTeamDtoApi = {
        name: name,
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
            tap((team) => {
              if (team) {
                this.teamChanged?.emit(team[0]);
              }
              this.activeOffcanvas.close();
            }),
          )
          .subscribe();
      }
    }
  }

  updateTeamInfos(team: TeamDtoApi, formProgs: ProgramDtoApi[], members: UserDtoApi[]): Observable<any>[] {
    const output$: Observable<any>[] = [of(null)];

    const initialTeamProgs = (this.team?.programs || []).reduce((result, program) => {
      const longProg = this.programs.find((po) => program.id === po.id);
      if (longProg && !result.find((p) => p.id === longProg.id)) {
        result.push(longProg);
      }
      return result;
    }, [] as ProgramDtoApi[]);

    initialTeamProgs.forEach((p) => {
      if (!formProgs.find((po) => po.id === p.id)) {
        output$.push(
          this.programService.updateProgram(p.id, {
            teamIds: p.teams.filter((t) => t.id !== team.id).map((t) => ({ id: t.id })),
          }),
        );
        this.programService.resetCache();
      }
    });

    if (formProgs) {
      formProgs.forEach((p) => {
        if (!initialTeamProgs.find((po) => po.id === p.id) && team) {
          // To Add
          output$.push(
            this.programService.updateProgram(p.id, {
              teamIds: [...p.teams, team].map((t) => ({ id: t.id })),
            }),
          );
          this.programService.resetCache();
        }
      });
    }

    members?.forEach((member) => {
      if (member.teamId !== team.id) {
        output$.push(this.userRestService.patchUser(member.id, { teamId: team.id }));
      }
    });

    return output$;
  }

  uniqueNameValidation(teams: string[]): ValidatorFn {
    return (control: AbstractControl) => {
      const typedName = control.value.toLowerCase();

      if (teams && teams.includes(typedName)) {
        return { nameNotAllowed: true };
      }
      return null;
    };
  }
}
