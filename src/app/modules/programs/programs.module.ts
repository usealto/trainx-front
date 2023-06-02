import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ProgramsRoutingModule } from './programs-routing.module';
import { ProgramsComponent } from './components/programs/programs.component';
import { CreateProgramsComponent } from './components/create-programs/create-programs.component';
import { ProgramsFormComponent } from './components/create-programs/programs-form/programs-form.component';
import { QuestionFormComponent } from './components/questions/question-form/question-form.component';
import { TagsFormComponent } from './components/tags/tag-form/tag-form.component';
import { AutoResizeTextareaDirective } from 'src/app/core/utils/directives/auto-resize-textarea.directive';

@NgModule({
  declarations: [
    ProgramsComponent,
    CreateProgramsComponent,
    ProgramsFormComponent,
    QuestionFormComponent,
    TagsFormComponent,
  ],
  imports: [CommonModule, ProgramsRoutingModule, SharedModule],
})
export class ProgramsModule {}
