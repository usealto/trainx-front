import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { QuestionSubmittedFormComponent } from '../training/components/training/question-submitted-form/question-submitted-form.component';
import { TagsFormComponent } from './components/create-tags/tag-form.component';
import { EditProgramsComponent } from './components/edit-program/edit-program.component';
import { ProgramCardListComponent } from './components/programs/program-card-list/program-card-list.component';
import { ProgramsQuestionsComponent } from './components/programs/programs-questions/programs-questions.component';
import { ProgramsTagsComponent } from './components/programs/programs-tags/programs-tags.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { ProgramsRoutingModule } from './programs-routing.module';
import { ChartsModule } from '../charts/charts.module';

@NgModule({
  declarations: [
    ProgramsComponent,
    TagsFormComponent,
    QuestionSubmittedFormComponent,
    ProgramCardListComponent,
    ProgramsQuestionsComponent,
    ProgramsTagsComponent,
    EditProgramsComponent,
  ],
  imports: [CommonModule, ProgramsRoutingModule, SharedModule, ChartsModule],
})
export class ProgramsModule {}
