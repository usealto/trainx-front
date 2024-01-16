import { ScoreDtoApi } from '@usealto/sdk-ts-angular';
import { PillOption, SelectOption } from '../modules/shared/models/select-option.model';

export enum ScoreFilter {
  Under25 = '< 25%',
  Under50 = '< 50%',
  Under75 = '< 75%',
  Over25 = '> 25%',
  Over50 = '> 50%',
  Over75 = '> 75%',
}

export const scoreFilterToPillOptions = (): PillOption[] => {
  return [
    new PillOption({ value: ScoreFilter.Under25, label: ScoreFilter.Under25, color: 'primary' }),
    new PillOption({ value: ScoreFilter.Under50, label: ScoreFilter.Under50, color: 'primary' }),
    new PillOption({ value: ScoreFilter.Under75, label: ScoreFilter.Under75, color: 'primary'}),
    new PillOption({ value: ScoreFilter.Over25, label: ScoreFilter.Over25, color: 'success'}),
    new PillOption({ value: ScoreFilter.Over50, label: ScoreFilter.Over50, color: 'success'}),
    new PillOption({ value: ScoreFilter.Over75, label: ScoreFilter.Over75, color: 'success'}),
  ];
};


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
