import { Component, Input, OnInit } from '@angular/core';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TopFlop } from '../../models/score.model';

@Component({
  selector: 'alto-top-flop',
  templateUrl: './top-flop.component.html',
  styleUrls: ['./top-flop.component.scss'],
})
export class TopFlopComponent implements OnInit {
  @Input() leaderboard!: { name: string; score: number }[];
  @Input() size = 3;
  @Input() title!: string;
  @Input() subtitle!: string;
  Emoji = EmojiName;
  I18ns = I18ns;
  data: TopFlop = { top: [], flop: [] };
  rawLeaderboard!: { name: string; score: number }[];

  ngOnInit(): void {
    this.rawLeaderboard = [...this.leaderboard];

    this.leaderboard.splice(0, this.size).forEach((item) => {
      this.data.top.push({ label: item.name, avg: item.score });
    });

    this.leaderboard
      .splice(
        this.leaderboard.length - (this.leaderboard.length < this.size ? this.leaderboard.length : this.size),
        this.size,
      )
      .forEach((item) => {
        this.data.flop.push({ label: item.name, avg: item.score });
      });
    this.data.flop.reverse();
  }

  getPosition(label: string): number {
    return this.rawLeaderboard.findIndex((item) => item.name === label) + 1;
  }
}
