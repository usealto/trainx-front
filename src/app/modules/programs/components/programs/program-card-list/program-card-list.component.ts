import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GetProgramsStatsRequestParams } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, startWith, switchMap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { Company } from '../../../../../models/company.model';
import { Program } from '../../../../../models/program.model';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';
import { AltoRoutes } from '../../../../shared/constants/routes';
import { SelectOption } from '../../../../shared/models/select-option.model';
import { ScoresRestService } from '../../../../shared/services/scores-rest.service';
import { EScoreDuration } from '../../../../../models/score.model';

interface IProgramCard {
  program: Program;
  score?: number;
  participation?: number;
  userValidatedProgramCount?: number;
  teamsTooltip?: string;
}

@Component({
  selector: 'alto-program-card-list',
  templateUrl: './program-card-list.component.html',
  styleUrls: ['./program-card-list.component.scss'],
})
export class ProgramCardListComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  @Input() company!: Company;

  private programCards: IProgramCard[] = [];
  programCardsRows: IProgramCard[][] = [];

  readonly pageSize = 9;
  pageControl = new FormControl(1, { nonNullable: true });
  teamsOptions = new FormControl<FormControl<SelectOption>[]>([], { nonNullable: true });
  searchControl = new FormControl<string | null>(null);

  dataStatus = EPlaceholderStatus.LOADING;
  private readonly programCardListComponent = new Subscription();

  // @Output() programTotal = new EventEmitter<number>();
  // @Input() place: 'home' | 'program' = 'home';
  // @Input() isActive = false;

  // programs: ProgramDtoApi[] = [];
  // programsDisplay: ProgramDtoApi[] = [];

  // programsScores = new Map<string, number>();
  // programsProgress = new Map<string, number>();
  // programsInvolvement = new Map<string, number>();
  // programsMemberHaveValidatedCount = new Map<string, string>();
  // pageControl = new FormControl(1, { nonNullable: true });
  // count = 0;
  // pageSize = 3;

  // programFilters: ProgramFilters = { teams: [], search: '' };

  // displayToggle = false;
  // isSearchResult = false;
  // selectedItems: ProgramDtoApi[] = [];
  // ongoingProgramsDataStatus: PlaceholderDataStatus = 'loading';

  constructor(
    // private readonly scoreService: ScoresService,
    // private readonly programService: ProgramsService,
    // public readonly teamStore: TeamStore,
    // public readonly programStore: ProgramsStore,
    private readonly scoresRestService: ScoresRestService,
  ) {}

  ngOnInit(): void {
    // if (this.place === 'home' || this.isActive) {
    //   this.displayToggle = false;
    // } else if (this.place === 'program') {
    //   this.displayToggle = true;
    // }
    // this.getPrograms();
    // this.setPageSize();
    this.teamsOptions = new FormControl(
      this.company.teams.map((team) => {
        return new FormControl<SelectOption>(new SelectOption({ value: team.id, label: team.name }), {
          nonNullable: true,
        });
      }),
      { nonNullable: true },
    );

    this.programCardListComponent.add(
      combineLatest([
        this.pageControl.valueChanges.pipe(startWith(this.pageControl.value)),
        this.teamsOptions.valueChanges.pipe(startWith(this.teamsOptions.value)),
        this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
      ])
        .pipe(
          switchMap(([page, teamsControls, search]) => {
            const req: GetProgramsStatsRequestParams = {
              page,
              itemsPerPage: this.pageSize,
              search: search ?? undefined,
              teamIds: teamsControls.map((x) => x.value.value).join(','),
            };

            return this.scoresRestService.getPaginatedProgramsStats(EScoreDuration.All, false, req);
          }),
        )
        .subscribe((paginatedProgramsStats) => {
          const stats = paginatedProgramsStats.data ?? [];

          this.dataStatus =
            stats.length === 0
              ? this.teamsOptions.value.length || this.searchControl.value
                ? EPlaceholderStatus.NO_RESULT
                : EPlaceholderStatus.NO_DATA
              : EPlaceholderStatus.GOOD;

          this.programCards = stats.map((stat) => {
            return {
              program: this.company.programById.get(stat.program.id) as Program,
              score: stat.score,
              participation: stat.participation,
              userValidatedProgramCount: stat.userValidatedProgramCount,
              teamsTooltip: stat.teams
                .map(({ team }) => {
                  return this.company.teamById.get(team.id)?.name ?? undefined;
                })
                .filter((t) => !!t)
                .join(', '),
            };
          });

          this.programCardsRows = this.programCards.reduce<IProgramCard[][]>((acc, programCard, index) => {
            const rowIndex = Math.floor(index / 3);
            acc[rowIndex] = [...(acc[rowIndex] ?? []), programCard];
            return acc;
          }, []);
        }),
    );
  }

  resetFilters() {
    this.searchControl.patchValue(null, { emitEvent: false });
    this.teamsOptions.patchValue([], { emitEvent: false });
    this.pageControl.patchValue(1);
    // this.filterPrograms((this.programFilters = {}));
    // this.selectedItems = [];
    // this.isSearchResult = false;
    // this.ongoingProgramsDataStatus = 'good';
  }
}
