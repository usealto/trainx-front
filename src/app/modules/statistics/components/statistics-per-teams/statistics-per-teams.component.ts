import { Component, OnInit } from '@angular/core';
import { TeamDtoApi, TeamStatsDtoApi, UserStatsDtoApi } from '@usealto/sdk-ts-angular';
import { combineLatest, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TeamsRestService } from 'src/app/modules/lead-team/services/teams-rest.service';
import { UserFilters } from 'src/app/modules/profile/models/user.model';
import { ScoreDuration } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { DataForTable } from '../../models/statistics.model';

@Component({
  selector: 'alto-statistics-per-teams',
  templateUrl: './statistics-per-teams.component.html',
  styleUrls: ['./statistics-per-teams.component.scss'],
})
export class StatisticsPerTeamsComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;
  userFilters: UserFilters = { teams: [] as TeamDtoApi[], score: '' };
  duration: ScoreDuration = ScoreDuration.Trimester;

  teams: TeamDtoApi[] = [];
  members: DataForTable[] = [];

  membersDisplay: DataForTable[] = [];
  teamsDisplay: DataForTable[] = [];

  constructor(
    private readonly scoreRestService: ScoresRestService,
    private readonly scoreService: ScoresService,
    private readonly teamsRestService: TeamsRestService,
  ) {}

  ngOnInit(): void {
    this.getDatas();
  }

  getDatas() {
    combineLatest([
      this.scoreRestService.getTeamsStats(this.duration),
      this.scoreRestService.getTeamsStats(this.duration, true),
      this.scoreRestService.getUsersStats(this.duration),
      this.scoreRestService.getUsersStats(this.duration, true),
    ])
      .pipe(
        tap(([teams, teamsProg, users, usersProg]) => {
          this.teams = teams.map((t) => t.team);

          this.teamsDisplay = teams.map((t) => {
            const teamProg = teamsProg.find((tp) => tp.team.id === t.team.id);
            return this.dataForTeamTableMapper(t, teamProg);
          });
          this.membersDisplay = users.map((u) => {
            const userProg = usersProg.find((tp) => tp.user.id === u.user.id);
            return this.dataForMembersTableMapper(u, userProg);
          });
          this.members = this.membersDisplay;
        }),
      )
      .subscribe();
  }

  filterMembers({ search = this.userFilters.search, teams = this.userFilters.teams }) {
    this.userFilters.search = search;
    this.userFilters.teams = teams;

    let output = this.members;
    if (teams && teams.length > 0) {
      output = output.filter((member) => teams.some((t) => t.id === member.owner?.teamId));
    }
    if (search && search !== '') {
      output = output.filter((member) =>
        (member.owner?.firstname + ' ' + member.owner?.lastname).toLowerCase().includes(search.toLowerCase()),
      );
    }

    this.membersDisplay = output;
  }

  changeDuration(duration: string) {
    this.duration = duration as ScoreDuration;
    this.getDatas();
  }

  dataForTeamTableMapper(t: TeamStatsDtoApi, tProg?: TeamStatsDtoApi) {
    return {
      team: t.team,
      globalScore: t.score,
      answeredQuestionsCount: t.totalGuessesCount,
      answeredQuestionsProgression: this.scoreService.getProgression(
        t.totalGuessesCount,
        tProg?.totalGuessesCount,
      ),
      commentsCount: t.commentsCount,
      commentsProgression: this.scoreService.getProgression(t.commentsCount, tProg?.commentsCount),
      submittedQuestionsCount: t.questionsSubmittedCount,
      submittedQuestionsProgression: this.scoreService.getProgression(
        t.questionsSubmittedCount,
        tProg?.questionsSubmittedCount,
      ),
      leastMasteredTags: t.tags
        ?.filter((ta) => (ta.score ?? 0) < 50)
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .slice(0, 3)
        .map((t) => t.tag.name),
    } as DataForTable;
  }

  dataForMembersTableMapper(u: UserStatsDtoApi, uProg?: UserStatsDtoApi) {
    return {
      owner: u.user,
      globalScore: u.score,
      answeredQuestionsCount: u.totalGuessesCount,
      answeredQuestionsProgression: this.scoreService.getProgression(
        u.totalGuessesCount,
        uProg?.totalGuessesCount,
      ),
      commentsCount: u.commentsCount,
      commentsProgression: this.scoreService.getProgression(u.commentsCount, uProg?.commentsCount),
      submittedQuestionsCount: u.questionsSubmittedCount,
      submittedQuestionsProgression: this.scoreService.getProgression(
        u.questionsSubmittedCount,
        uProg?.questionsSubmittedCount,
      ),
      leastMasteredTags: u.tags
        ?.filter((ta) => (ta.score ?? 0) < 50)
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .slice(0, 3)
        .map((t) => t.tag.name),
    } as DataForTable;
  }
}
