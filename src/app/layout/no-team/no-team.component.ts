import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';

@Component({
  selector: 'alto-no-team',
  templateUrl: './no-team.component.html',
  styleUrls: ['./no-team.component.scss'],
})
export class NoTeamComponent implements OnInit {
  I18ns = I18ns;
  adminMail = '';

  constructor(private readonly userRestService: UsersRestService) {}

  ngOnInit(): void {
    this.userRestService
      .getUsersFiltered({ isCompanyAdmin: true })
      .pipe(tap((res) => (this.adminMail = res[0].email)))
      .subscribe();
  }
}
