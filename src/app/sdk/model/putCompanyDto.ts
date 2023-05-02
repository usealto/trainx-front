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
import { WeekDayEnumApi } from './weekDayEnum';
import { SlackTimeEnumApi } from './slackTimeEnum';


export interface PutCompanyDtoApi { 
    /**
     * The domain (email ending) of a company  The regular expression will match any string that starts with one or more domain labels, each separated by a period (e.g., \"sub.subdomain.com\"), the domain labels can include letters, numbers, and hyphens, but cannot start or end with a hyphen. The final label must be at least 2 characters long and can only contain letters. builded with the help of this post : https://stackoverflow.com/questions/7930751/regexp-for-subdomain
     */
    domain?: string;
    /**
     * Status of the slack integration True if slack is active for this company False is flack is NOT active for this company
     */
    isSlackActive?: boolean;
    /**
     * List of days on which slack will send questions
     */
    slackDays: Array<WeekDayEnumApi>;
    /**
     * Number of questions to send per quiz
     */
    slackQuestionsPerQuiz: number;
    /**
     * List of times on which slack will send questions formated HhMM (e.g. 10h, 8h30)
     */
    slackTimes: Array<SlackTimeEnumApi>;
    /**
     * The name of the company
     */
    name: string;
    /**
     * The pathfix identifier of the slack administrator
     */
    slackAdmin: string;
}

