import { Component, Input, OnInit } from '@angular/core';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';

export type DataDisplay = 'count' | 'progress' | 'score';

export interface ILeaderboardData {
  name: string;
  score: number;
  progression?: number;
}

interface LeaderboardDataDisplay extends ILeaderboardData {
  index: number;
}

@Component({
  selector: 'alto-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;

  @Input() data!: ILeaderboardData[];
  @Input() size = 3;
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() config: DataDisplay[] = [];

  top: LeaderboardDataDisplay[] = [];
  flop: LeaderboardDataDisplay[] = [];

  leaderboard: LeaderboardDataDisplay[] = [];

  ngOnInit(): void {
    this.data = this.data.sort((a, b) => b.score - a.score);
    this.leaderboard = this.data.map((e, i) => ({ ...e, index: i + 1 }));
    const temp = [...this.leaderboard];
    this.top = temp.splice(0, this.size);
    this.flop = temp.splice(temp.length - (temp.length < this.size ? temp.length : this.size), this.size);
  }

  @memoize()
  getScoreColor(score: number): string {
    score = this.config.includes('score') ? score * 100 : score;

    if (score > 70) {
      return 'alto-green';
    } else if (score > 40) {
      return 'alto-warning';
    } else if (score >= 0) {
      return 'alto-red';
    }
    return 'alto-grey';
  }

  @memoize()
  getPositionColor(i: number) {
    if (i === 1) {
      return 'alto-green';
    } else if (i === this.leaderboard.length) {
      return 'alto-red';
    } else {
      return 'alto-warning';
    }
  }
}
