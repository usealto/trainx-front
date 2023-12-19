import { TagStatsLightDtoApi } from "@usealto/sdk-ts-angular";
import { BaseModel } from "./base.model";

export interface ITagStats {
  tagId: string;
  totalGuessesCount: number;
  validGuessesCount: number;
  score: number;
}

export class TagStats {
  tagId: string;
  totalGuessesCount: number;
  validGuessesCount: number;
  score: number;

  constructor(data: ITagStats) {
    this.tagId = data.tagId;
    this.totalGuessesCount = data.totalGuessesCount;
    this.validGuessesCount = data.validGuessesCount;
    this.score = data.score;
  }

  static fromDto(data: TagStatsLightDtoApi): TagStats {
    return new TagStats({
      tagId: data.tag.id,
      totalGuessesCount: data.totalGuessesCount || 0,
      validGuessesCount: data.validGuessesCount || 0,
      score: data.score || 0,
    });
  }

  get rawData(): ITagStats {
    return {
      tagId: this.tagId,
      totalGuessesCount: this.totalGuessesCount,
      validGuessesCount: this.validGuessesCount,
      score: this.score,
    };
  }
}
