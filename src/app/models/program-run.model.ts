import { ProgramRunDtoApi } from '@usealto/sdk-ts-angular';

export interface IProgramRun {
  id: string;
  finishedAt?: Date;
  programId: string;
  questionsCount: number;
  goodGuessesCount: number;
  guessesCount: number;
  isValid?: boolean;
  authorId?: string;
  companyId: string;
  updatedAt?: Date;
  lastLaunchDate: Date;
}

export class ProgramRun implements IProgramRun {
  id: string;
  finishedAt?: Date;
  programId: string;
  questionsCount: number;
  goodGuessesCount: number;
  guessesCount: number;
  isValid?: boolean;
  authorId?: string;
  companyId: string;
  updatedAt?: Date;
  duration: number;
  lastLaunchDate: Date;

  constructor(data: IProgramRun) {
    this.id = data.id;
    this.finishedAt = data.finishedAt;
    this.programId = data.programId;
    this.questionsCount = data.questionsCount;
    this.goodGuessesCount = data.goodGuessesCount;
    this.guessesCount = data.guessesCount;
    this.isValid = data.isValid;
    this.authorId = data.authorId;
    this.companyId = data.companyId;
    this.updatedAt = data.updatedAt;
    this.duration = data.questionsCount * 30;
    this.lastLaunchDate = data.lastLaunchDate;
  }

  static fromDto(dto: ProgramRunDtoApi): ProgramRun {
    return new ProgramRun({
      id: dto.id,
      finishedAt: dto.finishedAt,
      programId: dto.programId,
      questionsCount: dto.questionsCount,
      goodGuessesCount: dto.goodGuessesCount,
      guessesCount: dto.guessesCount,
      isValid: dto.isValid,
      authorId: dto.author?.id,
      companyId: dto.companyId,
      updatedAt: dto.updatedAt,
      lastLaunchDate: dto.lastLaunchDate ?? dto.createdAt,
    });
  }
}
