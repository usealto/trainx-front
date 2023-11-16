import {
  CompanyDtoApi,
  CompanyDtoApiConnectorDaysEnumApi,
  CompanyDtoApiConnectorEnumApi,
  CompanyDtoApiConnectorTimesEnumApi,
} from '@usealto/sdk-ts-angular';

interface ICompany {
  id: string;
  name: string;
  connector?: CompanyDtoApiConnectorEnumApi;
  isConnectorActive?: boolean;
  connectorDays?: Array<CompanyDtoApiConnectorDaysEnumApi>;
  connectorQuestionsPerQuiz?: number;
  connectorTimes?: Array<CompanyDtoApiConnectorTimesEnumApi>;
  adminIds: string[];
  usersHaveWebAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class Company implements ICompany {
  id: string;
  name: string;
  connector?: CompanyDtoApiConnectorEnumApi;
  isConnectorActive?: boolean;
  connectorDays?: Array<CompanyDtoApiConnectorDaysEnumApi>;
  connectorQuestionsPerQuiz?: number;
  connectorTimes?: Array<CompanyDtoApiConnectorTimesEnumApi>;
  adminIds: string[];
  usersHaveWebAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  constructor(params: CompanyDtoApi) {
    this.id = params.id;
    this.name = params.name;
    this.connector = params.connector;
    this.isConnectorActive = params.isConnectorActive;
    this.connectorDays = params.connectorDays;
    this.connectorQuestionsPerQuiz = params.connectorQuestionsPerQuiz;
    this.connectorTimes = params.connectorTimes;
    this.adminIds = params.admins ? params.admins.map((a) => a.id) : [];
    this.usersHaveWebAccess = params.usersHaveWebAccess;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  get rawData(): string {
    return JSON.stringify(this);
  }
}
