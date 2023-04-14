import { Component, OnInit } from '@angular/core';
import { CompanyForm } from './models/company.create';
import { CompaniesRestService } from 'src/app/modules/companies/service/companies-rest.service';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { UntypedFormBuilder } from '@angular/forms';
import { SlackTimeEnumApi, WeekDayEnumApi } from 'src/app/sdk';
import { Router } from '@angular/router';

@Component({
  selector: 'alto-admin-companies-create',
  templateUrl: './admin-companies-create.component.html',
  styleUrls: ['./admin-companies-create.component.scss']
})
export class AdminCompaniesCreateComponent implements OnInit {
  companyForm!: IFormGroup<CompanyForm>;
  private fb: IFormBuilder;

  constructor(private readonly companiesRestService:CompaniesRestService, private readonly router:Router, readonly fob: UntypedFormBuilder) {
    this.fb = fob
   }

  ngOnInit(): void {
    this.companyForm = this.fb.group<CompanyForm>({
      name: ['', []],
      domain: ['', []],
    });
  }

  async submit() {
    if (!this.companyForm.value) return;

    const {
      name,
      domain,
    } = this.companyForm.value;
    const slackDays = [ "Monday", "Wednesday", "Friday" ] as WeekDayEnumApi[]
    const slackQuestionsPerQuiz = 2
    const slackTimes = ["13h30"] as SlackTimeEnumApi[]
    const slackAdmin = ''
    const tempBubbleId = 'default'


    this.companiesRestService.createCompany({name, domain, slackDays, slackQuestionsPerQuiz, slackTimes, slackAdmin, tempBubbleId}) 
    .subscribe();

    this.router.navigate(['/admin/companies']);

}

}
