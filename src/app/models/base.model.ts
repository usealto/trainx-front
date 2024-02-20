export interface IBaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class BaseModel implements IBaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  constructor(data: IBaseModel) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }

  get rawData(): IBaseModel {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.createdAt,
      deletedAt: this.deletedAt,
    }
  }
}
