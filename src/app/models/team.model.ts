import { TeamDtoApi } from '@usealto/sdk-ts-angular';

interface ITeam {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  programIds: string[];
}

export class Team implements ITeam {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  programIds: string[];

  constructor(params: TeamDtoApi) {
    this.id = params.id;
    this.name = params.name;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.programIds = params.programs.map((p) => p.id);
  }

  get rawData(): string {
    return JSON.stringify(this);
  }
}
