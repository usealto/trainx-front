import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { QuestionStatsDtoApi, TeamStatsDtoApi } from '@usealto/sdk-ts-angular';
import { switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { TeamsStatsFilters } from 'src/app/modules/shared/models/stats.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';

@UntilDestroy()
@Component({
  selector: 'alto-performance-questions-table',
  templateUrl: './performance-questions-table.component.html',
  styleUrls: ['./performance-questions-table.component.scss'],
})
export class PerformanceQuestionsTableComponent implements OnInit, OnChanges {
  I18ns = I18ns;

  @Input() duration: ScoreDuration = ScoreDuration.Year;

  questionFilters: TeamsStatsFilters = {
    programs: [],
    tags: [],
    teams: [],
    search: '',
  };

  questions: QuestionStatsDtoApi[] = [];
  questionsPreviousPeriod: QuestionStatsDtoApi[] = [];
  questionsDisplay: QuestionStatsDtoApi[] = [];
  paginatedQuestions: QuestionStatsDtoApi[] = [];
  questionsPage = 1;
  questionsPageSize = 5;

  scoreIsLoading = false;

  constructor(
    public readonly teamStore: TeamStore,
    public readonly programsStore: ProgramsStore,
    private readonly scoreRestService: ScoresRestService,
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
      search = this.questionFilters.search,
    }: TeamsStatsFilters = this.questionFilters,
  ) {
    this.questionFilters.duration = duration;
    // this.teamFilters.teams = teams;
    this.questionFilters.search = search;

    let output: QuestionStatsDtoApi[] = this.questions;

    if (search) {
      output = output.filter((t) => t.question.title.includes(search));
    }
    // if (teams && teams.length > 0) {
    //   output = output.filter((t) => teams.some((pr) => pr === t.id));
    // }

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
  }

  @memoize()
  getTeamPreviousScore(team: TeamStatsDtoApi) {
    const prevScore = this.questionsPreviousPeriod.filter((t) => t.id === team.id)[0]?.score || 0;
    return prevScore && team.score ? team.score - prevScore : 0;
  }
}
