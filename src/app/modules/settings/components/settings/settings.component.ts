import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { IAppData } from '../../../../core/resolvers';
import { EResolvers, ResolversService } from '../../../../core/resolvers/resolvers.service';
import { Company } from '../../../../models/company.model';
import { ITabOption } from '../../../shared/components/tabs/tabs.component';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'alto-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;
  activeTab = 1;

  company!: Company;
  users!: User[];

  tabOptions: ITabOption[] = [
    { label: I18ns.settings.users.title, value: 1 },
    { label: I18ns.settings.continuousSession.title, value: 2 },
  ];
  tabControl = new FormControl<ITabOption>(this.tabOptions[0], { nonNullable: true });

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = (data[EResolvers.AppResolver] as IAppData).company;
    this.users = Array.from((data[EResolvers.AppResolver] as IAppData).userById.values());
  }
}
