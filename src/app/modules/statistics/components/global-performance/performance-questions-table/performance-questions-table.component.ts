import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { QuestionStatsDtoApi, QuestionStatsTeamDtoApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, startWith, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProgramsStore } from 'src/app/modules/programs/programs.store';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration, ScoreFilter } from 'src/app/modules/shared/models/score.model';
import { PillOption } from 'src/app/modules/shared/models/select-option.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { Score } from '../../../../../models/score.model';

@Component({
  selector: 'alto-performance-questions-table',
  templateUrl: './performance-questions-table.component.html',
  styleUrls: ['./performance-questions-table.component.scss'],
})
export class PerformanceQuestionsTableComponent implements OnInit, OnDestroy {
  Emoji = EmojiName;
  I18ns = I18ns;

  @Input() durationControl: FormControl<ScoreDuration> = new FormControl(ScoreDuration.Year, {
    nonNullable: true,
  });

  questions: QuestionStatsDtoApi[] = [];
  questionsPreviousPeriod: QuestionStatsDtoApi[] = [];
  questionsDisplay: QuestionStatsDtoApi[] = [];
  questionsDataStatus: PlaceholderDataStatus = 'loading';
  questionsPageControl = new FormControl(1, { nonNullable: true });
  questionsPageSize = 5;

  scoreOptions: PillOption[] = Score.getFiltersPillOptions();

  scoreControl = new FormControl<PillOption | null>(null);
  questionSearchControl = new FormControl<string | null>(null);

  private readonly performanceQuestionsTableComponentSubscription = new Subscription();

  constructor(
    public readonly teamStore: TeamStore,
    public readonly programsStore: ProgramsStore,
    private readonly scoreRestService: ScoresRestService,
  ) {}

  ngOnInit(): void {
    this.performanceQuestionsTableComponentSubscription.add(
      this.durationControl.valueChanges
        .pipe(
          startWith(this.durationControl.value),
          switchMap((duration) => {
            return combineLatest([
              this.scoreRestService.getQuestionsStats(duration),
              this.scoreRestService.getQuestionsStats(duration, true),
            ]);
          }),
          tap(([questionsStats, prevQuestionsStats]) => {
            this.questions = questionsStats;
            this.questionsPreviousPeriod = prevQuestionsStats;
          }),
          switchMap(() => {
            return combineLatest([
              this.questionSearchControl.valueChanges.pipe(startWith(this.questionSearchControl.value)),
              this.scoreControl.valueChanges.pipe(startWith(this.scoreControl.value)),
              this.questionsPageControl.valueChanges.pipe(startWith(this.questionsPageControl.value)),
            ]);
          }),
        )
        .subscribe({
          next: ([search, scoreOption, page]) => {
            const filter = scoreOption ? (scoreOption.value as ScoreFilter) : null;
            const regex = search ? new RegExp(search, 'i') : null;
            this.questionsDisplay = this.questions
              .filter((question) => {
                return (
                  (regex ? regex.test(question.question.title) : true) &&
                  question.score &&
                  (filter ? Score.filterPercent(filter, question.score) : true)
                );
              })
              .slice((page - 1) * this.questionsPageSize, page * this.questionsPageSize);

            if (this.questions.length === 0) {
              this.questionsDataStatus = 'noData';
            } else {
              this.questionsDataStatus = this.questionsDisplay.length ? 'good' : 'empty';
            }
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.performanceQuestionsTableComponentSubscription.unsubscribe();
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
