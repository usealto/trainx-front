import { Component, Input, OnInit } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TeamStatsDtoApi } from '@usealto/sdk-ts-angular';
import { tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ScoreDuration } from '../../../models/score.model';
import { ScoresRestService } from '../../../services/scores-rest.service';

@Component({
  selector: 'alto-team-engagement-table',
  templateUrl: './team-engagement-table.component.html',
  styleUrls: ['./team-engagement-table.component.scss'],
})
export class TeamEngagementTableComponent implements OnInit {
  EmojiName = EmojiName;
  I18ns = I18ns;

  @Input() duration: ScoreDuration = ScoreDuration.Year;

  teams: TeamStatsDtoApi[] = [];
  teamsDisplay: TeamStatsDtoApi[] = [];
  paginatedTeams: TeamStatsDtoApi[] = [];
  teamsPage = 1;
  teamsPageSize = 5;

  constructor(private readonly scoreRestService: ScoresRestService) {}

  ngOnInit(): void {
    this.getTeamsByDuration();
  }

  getTeamsByDuration() {
    this.scoreRestService
      .getTeamsStats(this.duration as ScoreDuration)
      .pipe(
        tap((t) => {
          console.log(t);

          this.teams = t;
          this.teamsDisplay = t;

          this.changeTeamsPage(1);
        }),
      )
      .subscribe();
  }

  changeTeamsPage(page: number) {
    this.teamsPage = page;
    this.paginatedTeams = this.teamsDisplay.slice((page - 1) * this.teamsPageSize, page * this.teamsPageSize);
  }
}
