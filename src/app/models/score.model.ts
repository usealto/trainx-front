import { ScoreDtoApi } from '@usealto/sdk-ts-angular';

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
