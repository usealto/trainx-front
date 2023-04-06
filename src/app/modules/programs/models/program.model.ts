import { RequestDto } from '../../shared/models/request-dto';

export interface ProgramRequestDto extends RequestDto {
  tagIds?: string[];
  questionIds?: string[];
  teamIds?: string[];
  isActive?: boolean;
}

export interface Program {
  id: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  companyId: string;
  isActive: boolean;
  name: string;
  description: string;
  expectation: number;
  priority: Priority;
  showTimer: boolean;
  tempBubbleId: string;
  tags: Tag[];
  teams: Team[];
}

export type Priority = 'Medium' | 'High' | 'Low';

export interface Tag {
  id: string;
  name: string;
  description: string;
}

export interface Team {
  id: string;
  longName: string;
  shortName: string;
}
