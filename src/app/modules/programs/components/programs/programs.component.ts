import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TagDtoApi } from '@usealto/sdk-ts-angular';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { ILeadData } from '../../../../core/resolvers/lead.resolver';
import { EResolvers, ResolversService } from '../../../../core/resolvers/resolvers.service';
import { ReplaceInTranslationPipe } from '../../../../core/utils/i18n/replace-in-translation.pipe';
import { Company } from '../../../../models/company.model';
import { ITabOption } from '../../../shared/components/tabs/tabs.component';
import { ProgramsStore } from '../../programs.store';
import { TagsRestService } from '../../services/tags-rest.service';
import { TagsServiceService } from '../../services/tags-service.service';

enum EProgramsTabs {
  Programs = 'programs',
  Questions = 'questions',
  Tags = 'tags',
}

@Component({
  selector: 'alto-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class ProgramsComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  company!: Company;
  tags: TagDtoApi[] = [];
  EProgramsTabs = EProgramsTabs;

  readonly tabOptions: ITabOption[] = [
    { label: I18ns.programs.tabs.programs, value: EProgramsTabs.Programs },
    { label: I18ns.programs.tabs.questions, value: EProgramsTabs.Questions },
    { label: I18ns.programs.tabs.tags, value: EProgramsTabs.Tags },
  ];
  activeTab = new FormControl(this.tabOptions[0], { nonNullable: true });

  constructor(
    private readonly resolversService: ResolversService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = (data[EResolvers.LeadResolver] as ILeadData).company;
    this.tags = (data[EResolvers.LeadResolver] as ILeadData).tags;
  }
}
