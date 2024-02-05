import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TagDtoApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, debounceTime, map, startWith, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';
import { Company } from '../../../../../models/company.model';
import { TeamStats } from '../../../../../models/team.model';
import { TagsRestService } from '../../../../programs/services/tags-rest.service';
import { SelectOption } from '../../../../shared/models/select-option.model';
import { EScoreDuration } from '../../../../../models/score.model';

@Component({
  selector: 'alto-performance-teams-table',
  templateUrl: './performance-teams-table.component.html',
  styleUrls: ['./performance-teams-table.component.scss'],
})
export class PerformanceTeamsTableComponent implements OnInit, OnDestroy {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  EPlaceholderStatus = EPlaceholderStatus;

  @Input() company: Company = {} as Company;
  @Input() durationControl: FormControl<EScoreDuration> = new FormControl(EScoreDuration.Year, {
    nonNullable: true,
  });

  searchControl = new FormControl<string | null>(null);

  programOptions: SelectOption[] = [];
  programsControl = new FormControl([] as FormControl<SelectOption>[], { nonNullable: true });

  tagOptions: SelectOption[] = [];
  tagsControl = new FormControl([] as FormControl<SelectOption>[], { nonNullable: true });

  teamsStats: TeamStats[] = [];
  teamsStatsPrev: TeamStats[] = [];

  teamsDisplay: TeamStats[] = [];
  paginatedTeamsStats: TeamStats[] = [];
  teamsDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  teamsPageControl = new FormControl(1, { nonNullable: true });
  teamsPageSize = 5;

  private init = true;
  private readonly performanceTeamsTableComponentSubscription = new Subscription();

  constructor(
    public readonly teamStore: TeamStore,
    public readonly programsRestService: ProgramsRestService,
    public readonly tagsRestService: TagsRestService,
  ) {}

  ngOnInit(): void {
    this.performanceTeamsTableComponentSubscription.add(
      this.tagsRestService
        .getAllTags()
        .pipe(
          tap((tags) => {
            this.tagOptions = tags.map((tag) => new SelectOption({ label: tag.name, value: tag.id }));
            this.programOptions = this.company.programs.map(
              (program) => new SelectOption({ label: program.name, value: program.id }),
            );
          }),
          switchMap(() => {
            return combineLatest([
              this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)),
              this.programsControl.valueChanges.pipe(startWith(this.programsControl.value)),
              this.tagsControl.valueChanges.pipe(startWith(this.tagsControl.value)),
              this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
            ]);
          }),
          debounceTime(this.init ? 0 : 200),
          tap(() => (this.init = false)),
          map(([duration, programs, tags, search]) => {
            return <[EScoreDuration, string[], string[], string]>[
              duration,
              programs.map(({ value }) => value.value),
              tags.map(({ value }) => value.value),
              search,
            ];
          }),
        )
        .subscribe(([duration, programs, tags, search]) => {
          let teamStats = this.company.getStatsByPeriod(duration, false);
          this.teamsStatsPrev = this.company.getStatsByPeriod(duration, true);

          if (programs.length) {
            teamStats = teamStats.filter((t) =>
              t.programStats?.some((p) => programs.some((pr) => pr === p.programId)),
            );
          }

          if (tags.length) {
            teamStats = teamStats.filter((t) => t.tagStats?.some((p) => tags.some((pr) => pr === p.tagId)));
          }

          if (search) {
            teamStats = teamStats.filter((t) =>
              this.company.teamById
                .get(t.teamId)
                ?.name.toLocaleLowerCase()
                .includes(search.toLocaleLowerCase()),
            );
          }

          this.teamsDisplay = teamStats;
          this.teamsDataStatus =
            this.teamsDisplay.length === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;
          this.changeTeamsPage(1);
        }),
    );

    this.performanceTeamsTableComponentSubscription.add(
      this.teamsPageControl.valueChanges.subscribe((page) => this.changeTeamsPage(page)),
    );
  }

  ngOnDestroy(): void {
    this.performanceTeamsTableComponentSubscription.unsubscribe();
  }

  private changeTeamsPage(page: number) {
    this.paginatedTeamsStats = this.teamsDisplay.slice(
      (page - 1) * this.teamsPageSize,
      page * this.teamsPageSize,
    );
  }

  @memoize()
  getTeamPreviousScore(team: TeamStats) {
    const prevScore = this.teamsStatsPrev.filter((t) => t.teamId === team.teamId)[0]?.score || 0;
    return prevScore && team.score ? team.score - prevScore : 0;
  }

  getLowestScorePrograms(teamId: string): any[] {
    // Récupérer les statistiques de l'équipe spécifiée.
    const teamStats = this.teamsStats.find((team) => team.teamId === teamId)?.programStats;

    // Récupérer les programmes de l'équipe.
    const teamPrograms = this.company.getTeamPrograms(teamId);

    if (!teamStats || !teamPrograms) {
      return [];
    }

    // Associer chaque programme avec son score en utilisant les IDs des programmes.
    const programsWithScores = teamPrograms.map((program) => {
      const programStat = teamStats.find((stat) => stat.programId === program.id);
      return {
        ...program,
        score: programStat ? programStat.score : null,
      };
    });

    // Filtrer les programmes qui n'ont pas de score.
    const programsWithValidScores = programsWithScores.filter((program) => program.score !== null);

    // Trier les programmes par score en ordre croissant.
    programsWithValidScores.sort((a, b) => (a.score || 0) - (b.score || 0));

    // Retourner les trois programmes avec les scores les plus bas.
    return programsWithValidScores.slice(0, 3);
  }
}
