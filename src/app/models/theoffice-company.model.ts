import { CompanyDtoApi } from '@usealto/the-office-sdk-angular';

interface ICompanyLicense {
  quantity: number;
  applicationId: string;
}

class CompanyLicense implements ICompanyLicense {
  quantity: number;
  applicationId: string;

  constructor(data: ICompanyLicense) {
    this.quantity = data.quantity;
    this.applicationId = data.applicationId;
  }
}

export interface ITheOfficeCompany {
  domain?: string;
  name: string;
  id: string;
  createdAt: Date;
  createdByUserId?: string;
  createdByApplicationId?: string;
  updatedAt: Date;
  deletedAt?: Date;
  licenses: ICompanyLicense[];
}

export class TheOfficeCompany implements ITheOfficeCompany {
  domain?: string;
  name: string;
  id: string;
  createdAt: Date;
  createdByApplicationId?: string;
  createdByUserId?: string;
  updatedAt: Date;
  deletedAt?: Date | undefined;
  licenses: CompanyLicense[];

  constructor(data: ITheOfficeCompany) {
    this.id = data.id;
    this.name = data.name;
    this.domain = data.domain;
    this.createdAt = data.createdAt;
    this.createdByApplicationId = data.createdByApplicationId;
    this.createdByUserId = data.createdByUserId;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
    this.licenses = data.licenses.map((l) => new CompanyLicense(l));
  }


  static fromDto(data: CompanyDtoApi): TheOfficeCompany {
    return new TheOfficeCompany({
      id: data.id,
      name: data.name,
      domain: data.domain ?? '',
      createdAt: data.createdAt,
      createdByApplicationId: data.createdByApplicationId,
      createdByUserId: data.createdByUserId,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt,
      // TODO : check sdk problem
      licenses: (data as any).licenses?.map((l: any) => new CompanyLicense(l)) ?? [],
    });
  }
}
