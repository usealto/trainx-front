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
import { CommentApi } from './comment';
import { ProgramApi } from './program';
import { ProgramRunQuestionApi } from './programRunQuestion';
import { GuessApi } from './guess';
import { AnswerFormatTypeEnumApi } from './answerFormatTypeEnum';
import { TagApi } from './tag';
import { QuestionTypeEnumApi } from './questionTypeEnum';


/**
 * The question related to this comment.
 */
export interface CommentQuestionApi { 
    id: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
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
     * The programs associated with the question. Optional.
     */
    programs?: Array<ProgramApi>;
    /**
     * The array of accepted answers for the question. Must have at least one answer.
     */
    answersAccepted: Array<string>;
    /**
     * The array of wrong answers for the question. Must have at least one answer.
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
    /**
     * The comments associated with the question. Optional.
     */
    comments?: Array<CommentApi>;
    programRunQuestions: Array<ProgramRunQuestionApi>;
    guesses: Array<GuessApi>;
    /**
     * The bubble ID for the question.
     */
    tempBubbleId?: string;
    /**
     * The relevance of the question. This field is used for sorting questions for get next question for a user.
     */
    relevance?: number;
}



