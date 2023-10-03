import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnChanges {
  Emoji = EmojiName;
  I18ns = I18ns;

  @Input() leaderboard!: { name: string; score: number, progression?: number }[];
  @Input() size = 3;
  @Input() title!: string;
  @Input() subtitle!: string;

  top: { name: string; score: number, progression?: number }[] = [];
  flop: { name: string; score: number, progression?: number }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['leaderboard']) {
      const temp = [...this.leaderboard];
      this.top = temp.splice(0, this.size);
      this.flop = temp.splice(temp.length - (temp.length < this.size ? temp.length : this.size), this.size);
    }
  }

  getScoreColor(score: number): string {
    if (score > 70) {
      return 'alto-green';
    } else if (score > 40) {
      return 'alto-warning';
    } else if (score > 0) {
      return 'alto-red';
    }
    return 'alto-grey';
  }

  getPosition(label: string): number {
    return this.leaderboard.findIndex((item) => item.name === label) + 1;
  }
}
