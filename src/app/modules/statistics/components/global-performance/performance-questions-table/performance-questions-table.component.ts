import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  GetQuestionsStatsRequestParams,
  QuestionDtoApi,
  QuestionStatsDtoApi,
  QuestionStatsTeamDtoApi,
} from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, startWith, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { PillOption } from 'src/app/modules/shared/models/select-option.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { Score, EScoreFilter, EScoreDuration } from '../../../../../models/score.model';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';

interface IQuestionInfos {
  question: QuestionDtoApi;
  currentStats: QuestionStatsDtoApi;
  previousStats?: QuestionStatsDtoApi;
  progression?: number;
}

@Component({
  selector: 'alto-performance-questions-table',
  templateUrl: './performance-questions-table.component.html',
  styleUrls: ['./performance-questions-table.component.scss'],
})
export class PerformanceQuestionsTableComponent implements OnInit, OnDestroy {
  Emoji = EmojiName;
  I18ns = I18ns;
  EPlaceholderStatus = EPlaceholderStatus;

  @Input() durationControl: FormControl<EScoreDuration> = new FormControl(EScoreDuration.Year, {
    nonNullable: true,
  });

  questions: IQuestionInfos[] = [];
  questionsCount = 0;
  questionsDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  questionsPageControl = new FormControl(1, { nonNullable: true });
  questionsPageSize = 5;

  scoreOptions: PillOption[] = Score.getFiltersPillOptions();

  scoreControl = new FormControl<PillOption | null>(null);
  questionSearchControl = new FormControl<string | null>(null);

  private readonly performanceQuestionsTableComponentSubscription = new Subscription();

  constructor(private readonly scoreRestService: ScoresRestService) {}

  ngOnInit(): void {
    this.performanceQuestionsTableComponentSubscription.add(
      combineLatest([
        combineLatest([
          this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)),
          this.questionSearchControl.valueChanges.pipe(startWith(this.questionSearchControl.value)),
          this.scoreControl.valueChanges.pipe(startWith(this.scoreControl.value)),
        ]).pipe(tap(() => this.questionsPageControl.setValue(1))),
        this.questionsPageControl.valueChanges.pipe(startWith(this.questionsPageControl.value)),
      ])
        .pipe(
          switchMap(([[duration, searchTerm, score], page]) => {
            const req: GetQuestionsStatsRequestParams = {
              search: searchTerm ?? undefined,
              page,
              itemsPerPage: this.questionsPageSize,
            };

            switch (score?.value) {
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

            return combineLatest([
              this.scoreRestService.getPaginatedQuestionsStats(duration, false, req),
              this.scoreRestService.getPaginatedQuestionsStats(duration, true, req),
            ]);
          }),
        )
        .subscribe({
          next: ([
            { data: questionsStats = [], meta: questionsStatsMeta },
            { data: prevQuestionsStats = [] },
          ]) => {
            this.questions = questionsStats.map((currentStats) => {
              const prevStats = prevQuestionsStats.find((t) => t.id === currentStats.id);
              return {
                question: currentStats.question,
                currentStats,
                previousStats: prevStats,
                progression:
                  currentStats.score && prevStats?.score ? currentStats.score - prevStats.score : undefined,
              };
            });

            this.questionsCount = questionsStatsMeta.totalItems;

            if (questionsStats.length === 0) {
              this.questionsDataStatus = EPlaceholderStatus.NO_DATA;
            } else {
              this.questionsDataStatus = questionsStats.length
                ? EPlaceholderStatus.GOOD
                : EPlaceholderStatus.NO_RESULT;
            }
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.performanceQuestionsTableComponentSubscription.unsubscribe();
  }

  getBadTeams(teams: QuestionStatsTeamDtoApi[]) {
    return teams
      .filter((t) => (t.score || 0) < 0.5)
      .sort((a, b) => (a.score || 0) - (b.score || 0))
      .slice(0, 3);
  }
}
