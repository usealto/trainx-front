/**
 * Usealto API [DEV]
 * The usealto (also called alto) API swagger documentation
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { CompanyLightDtoApi } from './companyLightDto';
import { UserLightDtoApi } from './userLightDto';
import { TeamLightDtoApi } from './teamLightDto';


export interface ChallengeDtoApi { 
    name: string;
    guessesPerDay: number;
    reward: string;
    scoreMinPercent: number;
    type: ChallengeDtoApiTypeEnumApi;
    startDate: Date;
    endDate: Date;
    status: ChallengeDtoApiStatusEnumApi;
    leadUserId?: string;
    leadUser?: UserLightDtoApi;
    leadTeamId?: string;
    leadTeam?: TeamLightDtoApi;
    teams?: Array<TeamLightDtoApi>;
    company: CompanyLightDtoApi;
    companyId: string;
    id: string;
    createdAt: Date;
    createdBy: string;
    createdByUser: UserLightDtoApi;
    updatedAt: Date;
    deletedAt?: Date;
}
export enum ChallengeDtoApiTypeEnumApi {
    ByUser = 'byUser',
    ByTeam = 'byTeam'
};
export enum ChallengeDtoApiStatusEnumApi {
    Ended = 'ended',
    InProgress = 'inProgress'
};



