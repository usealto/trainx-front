import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { UserDtoApiRolesEnumApi, WeekDayEnumApi } from 'src/app/sdk';

export interface FiltersCompaniesList {
  
    Teams: string,
    IsSlackActive: boolean,
    userAdmin: string,
    sendingDays: string,
    nbQuestions: {
      min: number,
      max: number,
    },
  
}


@Component({
  selector: 'alto-admin-companies-filters-list',
  templateUrl: './admin-companies-filters-list.component.html',
  styleUrls: ['./admin-companies-filters-list.component.scss'],
})
export class AdminCompaniesFiltersListComponent {
  @Input() filters: any;
  private fb: IFormBuilder;
  SendingDaysValues = Object.keys(WeekDayEnumApi);
  userForm!: IFormGroup<any>;

  constructor(public activeOffcanvas: NgbActiveOffcanvas, readonly fob: UntypedFormBuilder) {
    this.fb = fob;
  }
  ngOnInit(): void {
    if (this.filters) {
      this.userForm = this.fb.group<any>({
        Teams: [this.filters.teams],
        IsSlackActive: [this.filters.IsSlackActive],
        userAdmin: [this.filters.userAdmin],
        sendingDays: [this.filters.sendingDays],
        nbQuestions: this.fb.group<any>({
          min: [this.filters.nbQuestions.min],
          max: [this.filters.nbQuestions.max],
        }),
      });
    } else {
      this.userForm = this.fb.group<any>({
        Teams: [''],
        IsSlackActive: [true],
        userAdmin: [''],
        sendingDays: [''],
        nbQuestions: this.fb.group<any>({
          min: [''],
          max: [''],
        }),
      });
    }
  }
}
