import { UserDtoApi, TeamDtoApi } from "@usealto/sdk-ts-angular";

export interface DataForTable {
    owner?: UserDtoApi ;
    team?: TeamDtoApi;
    globalScore: number;
    answeredQuestionsCount: number;
    answeredQuestionsProgression: number;
    commentsCount: number;
    commentsProgression: number;
    questionsPushedCount: number;
    submittedQuestionsCount: number;
    submittedQuestionsProgression: number;
    leastMasteredTags: string[];
  }
