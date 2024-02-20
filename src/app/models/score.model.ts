import { ScoreDtoApi } from '@usealto/sdk-ts-angular';
import { PillOption } from '../modules/shared/models/select-option.model';

export enum EScoreDuration {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Trimester = 'trimester',
  Year = 'year',
  All = 'all',
}

export enum EScoreFilter {
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
      new PillOption({
        value: EScoreFilter.Under25,
        label: EScoreFilter.Under25,
        pillColor: PillOption.getPrimaryPillColor(),
      }),
      new PillOption({
        value: EScoreFilter.Under50,
        label: EScoreFilter.Under50,
        pillColor: PillOption.getPrimaryPillColor(),
      }),
      new PillOption({
        value: EScoreFilter.Under75,
        label: EScoreFilter.Under75,
        pillColor: PillOption.getPrimaryPillColor(),
      }),
      new PillOption({
        value: EScoreFilter.Over25,
        label: EScoreFilter.Over25,
        pillColor: PillOption.getSuccessPillColor(),
      }),
      new PillOption({
        value: EScoreFilter.Over50,
        label: EScoreFilter.Over50,
        pillColor: PillOption.getSuccessPillColor(),
      }),
      new PillOption({
        value: EScoreFilter.Over75,
        label: EScoreFilter.Over75,
        pillColor: PillOption.getSuccessPillColor(),
      }),
    ];
  }

  static filterDecimal(filter: EScoreFilter, value: number): boolean {
    switch (filter) {
      case EScoreFilter.Under25:
        return value < 0.25;
      case EScoreFilter.Under50:
        return value < 0.5;
      case EScoreFilter.Under75:
        return value < 0.75;
      case EScoreFilter.Over25:
        return value > 0.25;
      case EScoreFilter.Over50:
        return value > 0.5;
      case EScoreFilter.Over75:
        return value > 0.75;
    }
  }

  static filterPercent(filter: EScoreFilter, value: number): boolean {
    switch (filter) {
      case EScoreFilter.Under25:
        return value < 25;
      case EScoreFilter.Under50:
        return value < 50;
      case EScoreFilter.Under75:
        return value < 75;
      case EScoreFilter.Over25:
        return value > 25;
      case EScoreFilter.Over50:
        return value > 50;
      case EScoreFilter.Over75:
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
