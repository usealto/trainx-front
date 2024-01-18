import { ScoreDtoApi } from '@usealto/sdk-ts-angular';
import { EColors, PillOption } from '../modules/shared/models/select-option.model';

export enum ScoreFilter {
  Under25 = '< 25%',
  Under50 = '< 50%',
  Under75 = '< 75%',
  Over25 = '> 25%',
  Over50 = '> 50%',
  Over75 = '> 75%',
}

export interface IScore {
  dates: Date[];
  averages: (number | null)[];
  counts: (number | null)[];
  valids: (number | null)[];
  id: string;
  label: string;
}

export class Score implements IScore {
  dates: Date[];
  averages: (number | null)[];
  counts: (number | null)[];
  valids: (number | null)[];
  id: string;
  label: string;

  constructor(data: IScore) {
    this.dates = data.dates;
    this.averages = data.averages;
    this.counts = data.counts;
    this.valids = data.valids;
    this.id = data.id;
    this.label = data.label;
  }

  static fromDto(data: ScoreDtoApi): Score {
    return new Score({
      dates: data.dates,
      averages: data.averages,
      counts: data.counts,
      valids: data.valids,
      id: data.id,
      label: data.label,
    });
  }

  static getFiltersPillOptions(): PillOption[] {
    return [
      new PillOption({ value: ScoreFilter.Under25, label: ScoreFilter.Under25, color: EColors.primary }),
      new PillOption({ value: ScoreFilter.Under50, label: ScoreFilter.Under50, color: EColors.primary }),
      new PillOption({ value: ScoreFilter.Under75, label: ScoreFilter.Under75, color: EColors.primary }),
      new PillOption({ value: ScoreFilter.Over25, label: ScoreFilter.Over25, color: EColors.success }),
      new PillOption({ value: ScoreFilter.Over50, label: ScoreFilter.Over50, color: EColors.success }),
      new PillOption({ value: ScoreFilter.Over75, label: ScoreFilter.Over75, color: EColors.success }),
    ];
  }

  static filterDecimal(filter: ScoreFilter, value: number): boolean {
    switch (filter) {
      case ScoreFilter.Under25:
        return value < 0.25;
      case ScoreFilter.Under50:
        return value < 0.5;
      case ScoreFilter.Under75:
        return value < 0.75;
      case ScoreFilter.Over25:
        return value > 0.25;
      case ScoreFilter.Over50:
        return value > 0.5;
      case ScoreFilter.Over75:
        return value > 0.75;
    }
  }

  static filterPercent(filter: ScoreFilter, value: number): boolean {
    switch (filter) {
      case ScoreFilter.Under25:
        return value < 25;
      case ScoreFilter.Under50:
        return value < 50;
      case ScoreFilter.Under75:
        return value < 75;
      case ScoreFilter.Over25:
        return value > 25;
      case ScoreFilter.Over50:
        return value > 50;
      case ScoreFilter.Over75:
        return value > 75;
    }
  }

  get rawData(): IScore {
    return {
      dates: this.dates,
      averages: this.averages,
      counts: this.counts,
      valids: this.valids,
      id: this.id,
      label: this.label,
    };
  }
}
