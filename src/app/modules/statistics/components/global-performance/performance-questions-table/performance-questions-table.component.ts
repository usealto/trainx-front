import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { QuestionStatsDtoApi } from '@usealto/sdk-ts-angular';
import { switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { QuestionFilters } from 'src/app/modules/programs/models/question.model';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ScoreDuration, ScoreFilter } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';

@UntilDestroy()
@Component({
  selector: 'alto-performance-questions-table',
  templateUrl: './performance-questions-table.component.html',
  styleUrls: ['./performance-questions-table.component.scss'],
})
export class PerformanceQuestionsTableComponent implements OnInit, OnChanges {
  Emoji = EmojiName;
  I18ns = I18ns;

  @Input() duration: ScoreDuration = ScoreDuration.Year;

  questionFilters: QuestionFilters = {
    programs: [],
    tags: [],
    teams: [],
    search: '',
  };

  questions: QuestionStatsDtoApi[] = [];
  questionsPreviousPeriod: QuestionStatsDtoApi[] = [];
  questionsDisplay: QuestionStatsDtoApi[] = [];
  paginatedQuestions: QuestionStatsDtoApi[] = [];
  paginatedQuestionsCount = 0;
  questionsPage = 1;
  questionsPageSize = 5;

  scoreIsLoading = false;

  constructor(
    public readonly teamStore: TeamStore,
    public readonly programsStore: ProgramsStore,
    private readonly scoreRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
  ) {}

  ngOnInit(): void {
    this.getQuestionsByDuration();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['duration']?.firstChange && changes['duration']?.currentValue) {
      this.getQuestionsByDuration();
    }
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

  getQuestionsByDuration() {
    this.scoreIsLoading = true;
    this.scoreRestService
      .getQuestionsStats(this.duration as ScoreDuration)
      .pipe(
        tap((t) => {
          this.questions = t;
          this.questionsDisplay = t;
          this.changeQuestionsPage(1);
        }),
        switchMap(() => this.scoreRestService.getQuestionsStats(this.duration, true)),
        tap((t) => (this.questionsPreviousPeriod = t)),
        tap(() => (this.scoreIsLoading = false)),
        tap(() => this.getQuestionsFiltered()),
        untilDestroyed(this),
      )
      .subscribe();
  }

  changeQuestionsPage(page: number) {
    this.questionsPage = page;
    this.paginatedQuestions = this.questionsDisplay.slice(
      (page - 1) * this.questionsPageSize,
      page * this.questionsPageSize,
    );
    this.paginatedQuestionsCount = this.paginatedQuestions.length;
  }

  @memoize()
  getQuestionPreviousScore(quest: QuestionStatsDtoApi) {
    const prevScore = this.questionsPreviousPeriod.filter((t) => t.id === quest.id)[0]?.score || 0;
    return prevScore && quest.score ? quest.score - prevScore : 0;
  }
}
