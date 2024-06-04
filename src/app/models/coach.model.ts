import { CoachDtoApi } from '@usealto/sdk-ts-angular';
import { BaseModel, IBaseModel } from './base.model';

export interface ICoach extends IBaseModel {
  name: string;
  pictureUrl?: string;
}

export class Coach extends BaseModel implements ICoach {
  name: string;
  pictureUrl?: string;

  constructor(data: ICoach) {
    super(data);
    this.name = data.name;
    this.id = data.id;
    this.pictureUrl = data.pictureUrl;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }

  static fromDto(data: CoachDtoApi): Coach {
    return new Coach({
      name: data.name,
      id: data.id,
      pictureUrl: data.pictureUrl,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
    });
  }

  override get rawData(): ICoach {
    return {
      ...super.rawData,
      name: this.name,
      pictureUrl: this.pictureUrl,
    };
  }
}
