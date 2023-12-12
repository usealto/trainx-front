import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { User } from 'src/app/models/user.model';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
@Component({
  selector: 'alto-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
  AltoRoutes = AltoRoutes;
  I18ns = I18ns;
  Emoji = EmojiName;
  route: string[] = [];

  constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.parent?.data.pipe(map(({ me }) => me as User)).subscribe((me) => {
      this.route =
        me.isAltoAdmin() || me.isCompanyAdmin()
          ? ['/', AltoRoutes.lead, AltoRoutes.leadHome]
          : ['/', AltoRoutes.user, AltoRoutes.userHome];
    });
  }
}
