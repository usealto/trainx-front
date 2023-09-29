import { Component, Input, OnInit } from '@angular/core';
import { TeamDtoApi, UserDtoApi } from '@usealto/sdk-ts-angular';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

interface DataForTable {
  owner: UserDtoApi | TeamDtoApi;
  globalScore: number;
  answeredQuestionsCount: number;
  answeredQuestionsProgression: number;
  commentsCount: number;
  commentsProgression: number;
  submittedQuestionsCount: number;
  submittedQuestionsProgression: number;
  leastMasteredTags: string[];
}

@Component({
  selector: 'alto-per-teams-table',
  templateUrl: './per-teams-table.component.html',
  styleUrls: ['./per-teams-table.component.scss'],
})
export class PerTeamsTableComponent implements OnInit {
  I18ns = I18ns;

  @Input() data: DataForTable[] = [];

  @Input() type!: string;

  fakeData1 = [
    {
      owner: {
        name: 'Manager',
        id: 'cbecb898-a0a8-43c4-b2b6-1e993f88bb8a',
      } as TeamDtoApi,
      globalScore: 12,
      answeredQuestionsCount: 15,
      answeredQuestionsProgression: 23,
      commentsCount: 54,
      commentsProgression: 92,
      submittedQuestionsCount: 2,
      submittedQuestionsProgression: 300,
      leastMasteredTags: ['tag1', 'tag2', 'tag3'],
    } as DataForTable,
  ];

  fakeData2 = [
    {
      owner: {
        firstname: 'Hugo',
        lastname: 'Poisot',
        id: '8517b813-fa25-46b2-b517-34b5ff37ec97',
      } as UserDtoApi,
      globalScore: 12,
      answeredQuestionsCount: 15,
      answeredQuestionsProgression: 23,
      commentsCount: 54,
      commentsProgression: 92,
      submittedQuestionsCount: 2,
      submittedQuestionsProgression: 300,
      leastMasteredTags: ['tag1', 'tag2', 'tag3'],
    } as DataForTable,
  ];

  ngOnInit(): void {
    this.data = this.fakeData2;
    return;
  }
}
