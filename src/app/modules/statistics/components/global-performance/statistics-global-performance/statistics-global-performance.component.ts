import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TagDtoApi } from '@usealto/sdk-ts-angular';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ILeadData } from '../../../../../core/resolvers/lead.resolver';
import { EResolvers, ResolversService } from '../../../../../core/resolvers/resolvers.service';
import { Company } from '../../../../../models/company.model';
import { EScoreDuration } from '../../../../../models/score.model';

@Component({
  selector: 'alto-statistics-global-performance',
  templateUrl: './statistics-global-performance.component.html',
  styleUrls: ['./statistics-global-performance.component.scss'],
})
export class StatisticsGlobalPerformanceComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;
  durationControl: FormControl<EScoreDuration> = new FormControl<EScoreDuration>(EScoreDuration.Trimester, {
    nonNullable: true,
  });
  company: Company = {} as Company;
  tags: TagDtoApi[] = [];

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
