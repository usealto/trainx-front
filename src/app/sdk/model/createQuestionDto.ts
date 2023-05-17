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
import { ProgramApi } from './program';
import { AnswerFormatTypeEnumApi } from './answerFormatTypeEnum';
import { TagApi } from './tag';
import { QuestionTypeEnumApi } from './questionTypeEnum';


export interface CreateQuestionDtoApi { 
    createdBy?: string;
    companyId?: string;
    type: QuestionTypeEnumApi;
    answerType: AnswerFormatTypeEnumApi;
    /**
     * The title of the question.
     */
    title: string;
    /**
     * The tags associated with the question. Optional.
     */
    tags?: Array<TagApi>;
    /**
     * The tags associated with the question. Optional.
     */
    programs?: Array<ProgramApi>;
    /**
     * The array of accepted answers for the question. Must have at least one answer.  Empty strings are forbidden. Each string in the array will be trimmed of leading and trailing whitespace.  The order of the answers does not matter but all the answers from the accepted answers of the question need to be provided in the guess.  For example if the accepted answers are: [\'a\', \'b\', \'c\'] If the user provides: [\'a\', \'b\']when creating the guess associated with the question, the guess will be invalid. If the user provides: [\'a\', \'b\', \'c\', \'d\'] when creating the guess associated with the question, the guess will be invalid. If the user provides: [\'a\', \'b\', \'c\'] when creating the guess associated with the question, the guess will be valid. If the user provides: [\'c\', \'b\', \'a\'] when creating the guess associated with the question, the guess will also be valid.
     */
    answersAccepted: Array<string>;
    /**
     * The array of wrong answers for the question. Must have at least one answer.  Empty strings are forbidden. Each string in the array will be trimmed of leading and trailing whitespace.
     */
    answersWrong: Array<string>;
    /**
     * An optional explanation for the question.
     */
    explanation?: string;
    /**
     * An optional link for the question.
     */
    link?: string;
}



