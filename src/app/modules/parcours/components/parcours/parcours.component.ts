import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ILeadData } from '../../../../core/resolvers/lead.resolver';
import { ResolversService, EResolvers } from '../../../../core/resolvers/resolvers.service';
import * as FromRoot from '../../../../core/store/store.reducer';
import { Company } from '../../../../models/company.model';
import { I18ns } from '../../../../core/utils/i18n/I18n';
import { EmojiName } from '../../../../core/utils/emoji/data';
import { ReplaceInTranslationPipe } from '../../../../core/utils/i18n/replace-in-translation.pipe';
import { Team } from '../../../../models/team.model';
import { AltoRoutes } from '../../../shared/constants/routes';


@Component({
  selector: 'alto-parcours',
  templateUrl: './parcours.component.html',
  styleUrls: ['./parcours.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class ParcoursComponent implements OnInit, AfterViewInit {
  @ViewChildren('wrapperList') wrappers!: QueryList<ElementRef<HTMLDivElement>>;
  @ViewChildren('listParcours') parcours!: QueryList<ElementRef<HTMLDivElement>>;
  I18ns = I18ns;
  Emoji = EmojiName;
  AltoRoutes = AltoRoutes;

  company: Company | null = null;
  teams: Team[] = [];
  totalParcours = 0;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly resolversService: ResolversService,
    private readonly store: Store<FromRoot.AppState>,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.company = (data[EResolvers.LeadResolver] as ILeadData).company;

    if (this.company) {
      this.teams = [...this.company.teams];

      this.teams.sort((a, b) => {
        if (a.parcour.length > 0 && b.parcour.length === 0) {
          return -1;
        } else if (a.parcour.length === 0 && b.parcour.length > 0) {
          return 1;
        }
        return (this.company?.teams.indexOf(a) || 0) - (this.company?.teams.indexOf(b) || 0);
      });

      this.totalParcours = this.teams.filter((team) => team.parcour.length > 0).length;
    }
  }

  ngAfterViewInit() {
    this.adjustAllScrolls();
  }

  getProgramName(programId: string): string {
    const program = this.company?.programs.find((p) => p.id === programId);
    return program ? program.name : 'Unknown Program';
  }

  adjustAllScrolls() {
    this.parcours.forEach((parcour) => {
      const wrapper = this.wrappers.find((w) => w.nativeElement.contains(parcour.nativeElement));
      if (wrapper) {
        const hasHorizontalScrollbar = parcour.nativeElement.scrollWidth > wrapper.nativeElement.clientWidth;
        parcour.nativeElement.style.justifyContent = hasHorizontalScrollbar ? 'flex-start' : 'center';
        wrapper.nativeElement.style.justifyContent = hasHorizontalScrollbar ? 'flex-start' : 'center';
        wrapper.nativeElement.style.paddingBottom = hasHorizontalScrollbar ? '9px' : '0';
      }
    });
  }
}
