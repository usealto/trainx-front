import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { QuestionStatsDtoApi, QuestionStatsTeamDtoApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, startWith, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { QuestionFilters } from 'src/app/modules/programs/models/question.model';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration, ScoreFilter } from 'src/app/modules/shared/models/score.model';
import { PillOption } from 'src/app/modules/shared/models/select-option.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { Score } from '../../../../../models/score.model';

@Component({
  selector: 'alto-performance-questions-table',
  templateUrl: './performance-questions-table.component.html',
  styleUrls: ['./performance-questions-table.component.scss'],
})
export class PerformanceQuestionsTableComponent implements OnInit, OnDestroy {
  Emoji = EmojiName;
  I18ns = I18ns;

  // @Input() duration: ScoreDuration = ScoreDuration.Year;
  @Input() durationControl: FormControl<ScoreDuration> = new FormControl(ScoreDuration.Year, {
    nonNullable: true,
  });

  questionFilters: QuestionFilters = {
    programs: [],
    tags: [],
    teams: [],
    search: '',
  };

  scoreControl = new FormControl<PillOption | null>(null);

  questions: QuestionStatsDtoApi[] = [];
  questionsPreviousPeriod: QuestionStatsDtoApi[] = [];
  questionsDisplay: QuestionStatsDtoApi[] = [];
  paginatedQuestions: QuestionStatsDtoApi[] = [];
  questionsDataStatus: PlaceholderDataStatus = 'loading';
  questionsPageControl = new FormControl(1, { nonNullable: true });
  questionsPageSize = 5;

  scoreOptions: PillOption[] = Score.getFiltersPillOptions();

  scoreIsLoading = true;

  private readonly performanceQuestionsTableComponentSubscription = new Subscription();

  constructor(
    public readonly teamStore: TeamStore,
    public readonly programsStore: ProgramsStore,
    private readonly scoreRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
  ) {}

  ngOnInit(): void {
    this.performanceQuestionsTableComponentSubscription.add(
      this.durationControl.valueChanges
        .pipe(
          startWith(this.durationControl.value),
          tap(() => (this.scoreIsLoading = true)),
          switchMap((duration) => {
            return combineLatest([
              this.scoreRestService.getQuestionsStats(duration),
              this.scoreRestService.getQuestionsStats(duration, true),
            ]);
          }),
        )
        .subscribe(([questionsStats, prevQuestionsStats]) => {
          this.questions = questionsStats;
          this.questionsDisplay = [...questionsStats];
          this.changeQuestionsPage(this.questionsPageControl.value);

          this.questionsPreviousPeriod = prevQuestionsStats;
          this.scoreIsLoading = false;
          this.getQuestionsFiltered();
        }),
    );

    this.performanceQuestionsTableComponentSubscription.add(
      this.scoreControl.valueChanges
        .pipe(
          startWith(this.scoreControl.value),
          tap((scoreOption) => {
            this.questionFilters.score = scoreOption ? scoreOption.value : undefined;
            this.getQuestionsFiltered();
          }),
        )
        .subscribe(),
    );

    this.performanceQuestionsTableComponentSubscription.add(
      this.questionsPageControl.valueChanges.subscribe((page) => this.changeQuestionsPage(page)),
    );
  }

  ngOnDestroy(): void {
    this.performanceQuestionsTableComponentSubscription.unsubscribe();
  }

  getQuestionsFiltered(
    {
      duration = this.questionFilters.duration,
      teams = this.questionFilters.teams,
      score = this.questionFilters.score,
      search = this.questionFilters.search,
    }: QuestionFilters = this.questionFilters,
  ) {
    this.questionFilters.duration = duration;
    this.questionFilters.teams = teams;
    this.questionFilters.score = score;
    this.questionFilters.search = search;

    let output: QuestionStatsDtoApi[] = this.questions;

    if (search) {
      output = output.filter((t) => t.question.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (teams && teams.length > 0) {
      output = output.filter((q) => q.teams?.some((t) => teams.some((te) => te === t.id)));
    }
    if (score) {
      output = this.scoreService.filterByScore(output, score as ScoreFilter, true);
    }

    this.questionsDisplay = output;

    this.changeQuestionsPage(1);
  }

  private changeQuestionsPage(page: number) {
    this.paginatedQuestions = this.questionsDisplay.slice(
      (page - 1) * this.questionsPageSize,
      page * this.questionsPageSize,
    );
    this.questionsDataStatus = this.paginatedQuestions.length === 0 ? 'noData' : 'good';
  }

  @memoize()
  getQuestionPreviousScore(quest: QuestionStatsDtoApi) {
    const prevScore = this.questionsPreviousPeriod.filter((t) => t.id === quest.id)[0]?.score || 0;
    return prevScore && quest.score ? quest.score - prevScore : 0;
  }

  getBadTeams(teams: QuestionStatsTeamDtoApi[]) {
    return teams
      .filter((t) => (t.score || 0) < 0.5)
      .sort((a, b) => (a.score || 0) - (b.score || 0))
      .slice(0, 3);
  }
}
