import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CompanyForm } from './models/company.create';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { FormArray, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import {
  CompanyDtoApi,
  CreateTeamDtoApi,
  SlackTimeEnumApi,
  TeamDtoApi,
  WeekDayEnumApi,
} from '@usealto/sdk-ts-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { Observable, forkJoin, from, map, mergeMap, switchMap, tap, toArray } from 'rxjs';
import { AdminTabsComponent } from '../admin-shared/admin-tabs/admin-tabs.component';
import { AdminUsersUploadFormComponent } from './admin-users-upload-form/admin-users-upload-form.component';
@Component({
  selector: 'alto-admin-companies-create',
  templateUrl: './admin-companies-create.component.html',
  styleUrls: ['./admin-companies-create.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminCompaniesCreateComponent implements OnInit {
  @ViewChild(AdminTabsComponent) tabs!: AdminTabsComponent;
  @ViewChild(AdminUsersUploadFormComponent) uploadFormComponent!: AdminUsersUploadFormComponent;
  edit = false;
  company!: CompanyDtoApi;
  companyForm!: IFormGroup<CompanyForm>;
  teams: TeamDtoApi[] = [];
  id: string | undefined;
  tabNumber = 0;
  weekDayEnum = Object.keys(WeekDayEnumApi);
  private fb: IFormBuilder;

  constructor(
    private readonly companiesRestService: CompaniesRestService,
    private readonly teamService: TeamsRestService,
    private readonly router: Router,
    private route: ActivatedRoute,
    readonly fob: UntypedFormBuilder,
  ) {
    this.fb = fob;
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || undefined;
    this.teamService
      .getTeams()
      .pipe(tap((teams) => (this.teams = teams)))
      .subscribe();
    this.companyForm = this.fb.group<CompanyForm>({
      name: ['', [Validators.required]],
      domain: ['', []],
      teams: ['', []],
      newTeams: this.fb.array([]),
      slackDays: [[]],
      slackQuestionsPerQuiz: [undefined],
      slackActive: [false],
      slackAdmin: ['', []],
    });
    if (this.id) {
      this.edit = true;
      this.companiesRestService
        .getCompanyById(this.id)
        .pipe(tap((company) => (this.company = company)))
        .pipe(
          tap(() => {
            console.log(this.company);
            this.companyForm = this.fb.group<CompanyForm>({
              domain: [this.company.domain || ''],
              name: [this.company.name, [Validators.required]],
              teams: [],
              newTeams: this.fb.array([]),
              slackDays: [this.company.slackDays],
              slackQuestionsPerQuiz: [this.company.slackQuestionsPerQuiz],
              slackActive: [this.company.isSlackActive],
              slackAdmin: [this.company.slackAdmin, []],
            });
          }),
        )
        .subscribe();
    }
  }

  get newTeams() {
    return this.companyForm.controls['newTeams'] as FormArray;
  }

  // Getter needed to loop in template without typescript error
  public get newTeamsFormArrayControls() {
    return (this.companyForm.controls['newTeams'] as FormArray).controls as FormGroup[];
  }

  addTeam() {
    const teamForm = this.fb.group({
      longName: ['', []],
      shortName: ['', []],
    });
    this.newTeams.push(teamForm);
  }

  deleteTeam(index: number) {
    this.newTeams.removeAt(index);
  }

  onSelectLogo(event: any) {
    console.log(event);
  }

  nextTab() {
    if (this.tabs) {
      this.tabs.selectNextTab();
    }
  }

  createTeams(companyId?: string): void {
    this.newTeams.value.forEach((team: CreateTeamDtoApi) => {
      this.teamService
        .createTeam({ shortName: team.shortName, longName: team.longName, companyId: companyId })
        .pipe(map((uploadedTeam) => uploadedTeam))
        .subscribe((res) => {
          console.log(res);
        });
    });
  }

  isFormDisabled(): boolean {
    if (this.edit) {
      return !this.companyForm.valid || this.companyForm.pristine || !this.companyForm.dirty;
    }
    return (
      this.uploadFormComponent?.csvData?.length <= 0 ||
      !this.uploadFormComponent?.csvData.some((user) => user.role === 'CompanyAdmin') ||
      !this.companyForm.valid ||
      this.companyForm.pristine ||
      !this.companyForm.dirty
    );
  }

  async submit() {
    if (!this.companyForm.value) return;

    this.createTeams();

    const { name, domain, slackDays, slackActive, slackQuestionsPerQuiz, slackAdmin } =
      this.companyForm.value;
    const slackTimes = ['13h30'] as SlackTimeEnumApi[];

    if (this.edit && this.id) {
      this.companiesRestService
        .patchCompany(this.id, {
          name,
          domain,
          slackDays: slackDays as WeekDayEnumApi[],
          slackQuestionsPerQuiz: slackQuestionsPerQuiz as number,
          slackTimes,
          slackAdmin: slackAdmin ?? '',
          isSlackActive: slackActive,
        })
        .subscribe(() => this.uploadFormComponent.upload(this.id));
    } else {
      this.companiesRestService
        .createCompany({
          name,
          domain,
          slackDays: slackDays as WeekDayEnumApi[],
          slackQuestionsPerQuiz: slackQuestionsPerQuiz as number,
          slackTimes,
          slackAdmin: slackAdmin ?? '',
          isSlackActive: slackActive,
        })
        .subscribe((company) => {
          console.log(company);
          this.uploadFormComponent.upload(company.data?.id);
          this.createTeams(company.data?.id);
        });
    }
  }
}
