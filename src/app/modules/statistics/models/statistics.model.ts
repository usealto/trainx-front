import { TeamDtoApi } from "@usealto/sdk-ts-angular";
import { User } from "../../../models/user.model";

export interface DataForTable {
    owner?: User;
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
