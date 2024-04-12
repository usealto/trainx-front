import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { EResolvers, ResolversService } from '../../../../core/resolvers/resolvers.service';
import * as FromRoot from '../../../../core/store/store.reducer';
import { ReplaceInTranslationPipe } from '../../../../core/utils/i18n/replace-in-translation.pipe';
import { ILeadData } from '../../../../core/resolvers/lead.resolver';
import { Company } from '../../../../models/company.model';
import { Team } from '../../../../models/team.model';
import { th } from 'date-fns/locale';
import { EmojiName } from '../../../../core/utils/emoji/data';
import { I18ns } from '../../../../core/utils/i18n/I18n';


@Component({
  selector: 'alto-edit-parcours',
  templateUrl: './edit-parcours.component.html',
  styleUrls: ['./edit-parcours.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class EditParcoursComponent implements OnInit {
  I18ns = I18ns;
  Emoji = EmojiName;
  
  company: Company | null = null;
  team: Team | null = null;
  isEdit = false;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly store: Store<FromRoot.AppState>,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = (data[EResolvers.LeadResolver] as ILeadData).company;
    const id = this.activatedRoute.snapshot.params['id'];
    this.team = this.company?.teams.find((team) => team.id === id) || null;
    if (this.team && this.team.parcour.length > 0) {
      this.isEdit = true;
    }
  }
}
