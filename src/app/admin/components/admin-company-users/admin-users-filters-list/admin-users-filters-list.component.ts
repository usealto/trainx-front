import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UserDtoApiRolesEnumApi } from '@usealto/sdk-ts-angular';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';

export interface FiltersUsersList {
  roles?: UserDtoApiRolesEnumApi[];
}

@Component({
  selector: 'alto-admin-users-filters-list',
  templateUrl: './admin-users-filters-list.component.html',
  styleUrls: ['./admin-users-filters-list.component.scss'],
})
export class AdminUsersFiltersListComponent implements OnInit {
  @Input() filters: FiltersUsersList | undefined;
  private fb: IFormBuilder;
  userForm!: IFormGroup<any>;
  rolesPossibleValues = Object.values(UserDtoApiRolesEnumApi);

  constructor(public activeOffcanvas: NgbActiveOffcanvas, readonly fob: UntypedFormBuilder) {
    this.fb = fob;
  }

  ngOnInit(): void {
    if (this.filters) {
      this.userForm = this.fb.group<FiltersUsersList>({
        roles: [this.filters.roles],
      });
    } else {
      this.userForm = this.fb.group<FiltersUsersList>({
        roles: [null],
      });
    }
  }
}
