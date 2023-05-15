import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CompanyForm } from './models/company.create';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { FormArray, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { CompanyDtoApi, SlackTimeEnumApi, TeamDtoApi, WeekDayEnumApi } from 'src/app/sdk';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { tap } from 'rxjs';
import { AdminTabsComponent } from '../admin-shared/admin-tabs/admin-tabs.component';
@Component({
  selector: 'alto-admin-companies-create',
  templateUrl: './admin-companies-create.component.html',
  styleUrls: ['./admin-companies-create.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminCompaniesCreateComponent implements OnInit {
  @ViewChild(AdminTabsComponent) tabs!: AdminTabsComponent;
  edit = false;
  company!: CompanyDtoApi;
  companyForm!: IFormGroup<CompanyForm>;
  teams: TeamDtoApi[] = [];
  id: string | undefined;
  tabNumber = 0;
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
      name: ['', []],
      domain: ['', []],
      teams: ['', []],
      newTeams: this.fb.array([]),
    });
    if (this.id) {
      this.edit = true;
      this.companiesRestService
        .getCompanyById(this.id)
        .pipe(tap((company) => (this.company = company)))
        .pipe(
          tap(() => {
            this.companyForm = this.fb.group<CompanyForm>({
              domain: [this.company.domain || ''],
              name: [this.company.name],
              teams: [''],
              newTeams: this.fb.array([]),
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

  async submit() {
    if (!this.companyForm.value) return;

    const { name, domain } = this.companyForm.value;
    const slackDays = ['Monday', 'Wednesday', 'Friday'] as WeekDayEnumApi[];
    const slackQuestionsPerQuiz = 2;
    const slackTimes = ['13h30'] as SlackTimeEnumApi[];
    const slackAdmin = '';

    this.companiesRestService
      .createCompany({ name, domain, slackDays, slackQuestionsPerQuiz, slackTimes, slackAdmin })
      .subscribe();

    this.router.navigate(['/admin/companies']);
  }
}
