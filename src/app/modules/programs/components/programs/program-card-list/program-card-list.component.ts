import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { GetProgramsStatsRequestParams } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, concat, debounceTime, map, of, startWith, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { updatePrograms } from '../../../../../core/store/root/root.action';
import * as FromRoot from '../../../../../core/store/store.reducer';
import { Company } from '../../../../../models/company.model';
import { Program } from '../../../../../models/program.model';
import { EScoreDuration, EScoreFilter, Score } from '../../../../../models/score.model';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';
import { AltoRoutes } from '../../../../shared/constants/routes';
import { PillOption, SelectOption } from '../../../../shared/models/select-option.model';
import { ScoresRestService } from '../../../../shared/services/scores-rest.service';
import { ProgramsRestService } from '../../../services/programs-rest.service';
import { ETab } from '../../../../../core/resolvers/edit-program.resolver';
import { PluralPipe } from '../../../../../core/utils/i18n/plural.pipe';

interface IProgramCard {
  program: Program;
  score?: number;
  participation?: number;
  userValidatedProgramCount?: number;
  totalUsersCount?: number;
  teamsTooltip?: string;
  isActiveControl: FormControl<boolean>;
}

enum EProgramType {
  Classic = 'classic',
  Accelerated = 'accelerated',
  All = 'all',
}

@Component({
  selector: 'alto-program-card-list',
  templateUrl: './program-card-list.component.html',
  styleUrls: ['./program-card-list.component.scss'],
})
export class ProgramCardListComponent implements OnInit, OnDestroy {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  ETab = ETab;
  pluralPipe = new PluralPipe();

  isCreateProgramBtnDropdownOpen = false;

  @Input() company!: Company;

  private programCards: IProgramCard[] = [];
  programCardsRows: IProgramCard[][] = [];

  readonly pageSize = 9;
  pageControl = new FormControl(1, { nonNullable: true });
  itemsCount = 0;

  searchControl = new FormControl<string | null>(null);

  teamsControls = new FormControl<FormControl<SelectOption>[]>([], { nonNullable: true });
  teamsOptions: SelectOption[] = [];

  scoreControl: FormControl<PillOption | null> = new FormControl(null);
  scoreOptions = Score.getFiltersPillOptions();

  programTypeOptions = [
    new SelectOption({ label: I18ns.programs.programs.allPrograms, value: EProgramType.All }),
    new SelectOption({
      label: this.pluralPipe.transform(I18ns.programs.programs.classic, 2),
      value: EProgramType.Classic,
      icon: 'bi-bullseye',
    }),
    new SelectOption({
      label: this.pluralPipe.transform(I18ns.programs.programs.accelerated, 2),
      value: EProgramType.Accelerated,
      icon: 'bi-rocket-takeoff',
    }),
  ];

  programTypeControl = new FormControl<SelectOption>(this.programTypeOptions[0], { nonNullable: true });

  dataStatus = EPlaceholderStatus.LOADING;

  isCreateProgramBtnOpen = false;

  private readonly programCardListComponent = new Subscription();
  private readonly activeProgramsSubscription = new Subscription();

  constructor(
    private readonly scoresRestService: ScoresRestService,
    private readonly programsRestService: ProgramsRestService,
    private readonly store: Store<FromRoot.AppState>,
    private el: ElementRef,
  ) {}

  ngOnInit(): void {
    this.teamsOptions = this.company.teams.map((team) => {
      return new SelectOption({ value: team.id, label: team.name });
    });

    this.programCardListComponent.add(
      combineLatest([
        this.pageControl.valueChanges.pipe(startWith(this.pageControl.value)),
        combineLatest([
          concat(of(this.searchControl.value), this.searchControl.valueChanges.pipe(debounceTime(300))),
          this.teamsControls.valueChanges.pipe(
            startWith(this.teamsControls.value),
            map((teamsControls) => teamsControls.map((x) => x.value)),
          ),
          this.scoreControl.valueChanges.pipe(startWith(this.scoreControl.value)),
          this.programTypeControl.valueChanges.pipe(startWith(this.programTypeControl.value)),
        ]).pipe(tap(() => this.pageControl.setValue(1))),
      ])
        .pipe(
          switchMap(([page, [search, selectedTeamsOptions, selectedScoreOption, programType]]) => {
            const req: GetProgramsStatsRequestParams = {
              page,
              sortBy: 'program.isActive:desc',
              itemsPerPage: this.pageSize,
              search: search || undefined,
              teamIds: selectedTeamsOptions.length
                ? selectedTeamsOptions.map((x) => x.value).join(',')
                : undefined,
              isAccelerated:
                programType.value === EProgramType.Accelerated
                  ? true
                  : programType.value === EProgramType.Classic
                  ? false
                  : undefined,
            };

            switch (selectedScoreOption?.value) {
              case EScoreFilter.Under25:
                req.scoreBelowOrEqual = 0.25;
                break;
              case EScoreFilter.Under50:
                req.scoreBelowOrEqual = 0.5;
                break;
              case EScoreFilter.Under75:
                req.scoreBelowOrEqual = 0.75;
                break;
              case EScoreFilter.Over25:
                req.scoreAboveOrEqual = 0.25;
                break;
              case EScoreFilter.Over50:
                req.scoreAboveOrEqual = 0.5;
                break;
              case EScoreFilter.Over75:
                req.scoreAboveOrEqual = 0.75;
                break;
            }

            return this.scoresRestService.getPaginatedProgramsStats(EScoreDuration.All, false, req);
          }),
        )
        .subscribe(({ data: stats = [], meta }) => {
          this.itemsCount = meta.totalItems;

          this.dataStatus =
            stats.length === 0
              ? this.teamsControls.value.length ||
                this.searchControl.value ||
                this.scoreControl.value ||
                this.programTypeControl.value.value !== EProgramType.All
                ? EPlaceholderStatus.NO_RESULT
                : EPlaceholderStatus.NO_DATA
              : EPlaceholderStatus.GOOD;

          this.programCards = stats.map((stat) => {
            return {
              program: this.company.programById.get(stat.program.id) as Program,
              score: stat.score,
              participation: stat.participation,
              userValidatedProgramCount: stat.userValidatedProgramCount,
              totalUsersCount: stat.totalUsersCount,
              teamsTooltip: (this.company.programById.get(stat.program.id) as Program).teamIds
                .map((teamId) => {
                  return this.company.teamById.get(teamId)?.name ?? undefined;
                })
                .filter((t) => !!t)
                .join(', '),
              isActiveControl: new FormControl(
                (this.company.programById.get(stat.program.id) as Program).isActive,
                {
                  nonNullable: true,
                },
              ),
            };
          });

          this.programCards.forEach(({ program, isActiveControl }) => {
            this.activeProgramsSubscription.add(
              isActiveControl.valueChanges
                .pipe(
                  switchMap((isActive) => {
                    return this.programsRestService.activate(program.id, isActive);
                  }),
                  switchMap((updatedProgram) => {
                    this.store.dispatch(updatePrograms({ programs: [updatedProgram] }));
                    return this.store.select(FromRoot.selectCompany);
                  }),
                  tap(({ data: company }) => {
                    this.company = company;
                  }),
                )
                .subscribe(),
            );
          });

          this.programCardsRows = this.programCards.reduce<IProgramCard[][]>((acc, programCard, index) => {
            const rowIndex = Math.floor(index / 3);
            acc[rowIndex] = [...(acc[rowIndex] ?? []), programCard];
            return acc;
          }, []);
        }),
    );
  }

  ngOnDestroy(): void {
    this.programCardListComponent.unsubscribe();
    this.activeProgramsSubscription.unsubscribe();
  }

  resetFilters() {
    this.searchControl.patchValue(null);
    this.teamsControls.patchValue([]);
    this.scoreControl.patchValue(null);
    this.programTypeControl.patchValue(this.programTypeOptions[0]);
    this.pageControl.patchValue(1);
  }

  toggleDropdown(): void {
    this.isCreateProgramBtnOpen = !this.isCreateProgramBtnOpen;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isCreateProgramBtnOpen = false;
    }
  }
}
