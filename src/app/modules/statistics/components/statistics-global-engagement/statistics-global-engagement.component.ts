import { Component, OnInit } from '@angular/core';
import { combineLatest, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';

@Component({
  selector: 'alto-statistics-global-engagement',
  templateUrl: './statistics-global-engagement.component.html',
  styleUrls: ['./statistics-global-engagement.component.scss'],
})
export class StatisticsGlobalEngagementComponent implements OnInit {
  I18ns = I18ns;
  EmojiName = EmojiName;
  duration: ScoreDuration = ScoreDuration.Trimester;

  leaderboard: { name: string; score: number; progression: number }[] = [];

  constructor(
    public readonly teamStore: TeamStore,
    private readonly scoreRestService: ScoresRestService,
    private readonly scoresService: ScoresService,
  ) {}

  ngOnInit(): void {
    this.getCompanyActivty();
  }

  getCompanyActivty() {
    combineLatest([
      this.scoreRestService.getTeamsStats(ScoreDuration.Trimester, false, 'totalGuessesCount:desc'),
      this.scoreRestService.getTeamsStats(ScoreDuration.Trimester, true, 'totalGuessesCount:desc'),
    ])
      .pipe(
        tap(([currentStats, previousStats]) => {
          currentStats = currentStats.filter((t) => t.score && t.score >= 0);
          previousStats = previousStats.filter((t) => t.score && t.score >= 0);
          this.leaderboard = currentStats.map((t) => {
            const previousScore = previousStats.find((p) => p.team.id === t.team.id)?.score;
            const progression = this.scoresService.getProgression(t.score, previousScore);
            return {
              name: t.team.name,
              score: t.totalGuessesCount ? t.totalGuessesCount / 100 : 0,
              progression: progression ? progression : 0,
            };
          });
        }),
      )
      .subscribe();
  }

  updateTimePicker(event: any): void {
    this.duration = event;
  }
}
