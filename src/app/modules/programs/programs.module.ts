import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CreateProgramsComponent } from './components/create-programs/create-programs.component';
import { ProgramsFormComponent } from './components/create-programs/programs-form/programs-form.component';
import { QuestionsTableComponent } from './components/create-programs/questions-table/questions-table.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { QuestionSubmittedFormComponent } from '../training/components/training/question-submitted-form/question-submitted-form.component';
import { TagsFormComponent } from './components/create-tags/tag-form.component';
import { ProgramsRoutingModule } from './programs-routing.module';
import { ProgramsQuestionsComponent } from './components/programs/programs-questions/programs-questions.component';

@NgModule({
  declarations: [
    ProgramsComponent,
    CreateProgramsComponent,
    ProgramsFormComponent,
    TagsFormComponent,
    QuestionSubmittedFormComponent,
    QuestionsTableComponent,
    ProgramsQuestionsComponent,
  ],
  imports: [CommonModule, ProgramsRoutingModule, SharedModule],
})
export class ProgramsModule {}
