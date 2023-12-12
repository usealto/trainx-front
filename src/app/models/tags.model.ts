import { TagStatsLightDtoApi } from "@usealto/sdk-ts-angular";

export class TagStatsLight {
  tagId: string;
  totalGuessesCount: number;
  validGuessesCount: number;
  score: number;

  constructor(data: TagStatsLight) {
    this.tagId = data.tagId;
    this.totalGuessesCount = data.totalGuessesCount;
    this.validGuessesCount = data.validGuessesCount;
    this.score = data.score;
  }

  static fromDto(data: TagStatsLightDtoApi): TagStatsLight {
    return new TagStatsLight({
      tagId: data.tag.id,
      totalGuessesCount: data.totalGuessesCount || 0,
      validGuessesCount: data.validGuessesCount || 0,
      score: data.score || 0,
    });
  }
}
