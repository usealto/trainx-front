import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NgbDatepickerModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AutoResizeTextareaDirective } from 'src/app/core/utils/directives/auto-resize-textarea.directive';
import { NgVar } from 'src/app/core/utils/directives/ng-var.directive';
import { TranslationModule } from 'src/app/core/utils/i18n/translation.module';
import { LoadingModule } from 'src/app/core/utils/loading/loading.module';
import { UtilsPipeModule } from 'src/app/core/utils/pipe/utils-pipe.module';
import { AnchorNavigatorComponent } from './components/anchor-navigator/anchor-navigator.component';
import { ColoredPillListComponent } from './components/colored-pill/colored-pill.component';
import { DropdownFilterComponent } from './components/dropdown-filter/dropdown-filter.component';
import { ImgBadgeComponent } from './components/img-badge/img-badge.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { PeriodFilterComponent } from './components/period-filter/period-filter.component';
import { ProfileCardComponent } from './components/profile-card/profile-card.component';
import { ProgramCardListComponent } from './components/program-card-list/program-card-list.component';
import { ProgramCardComponent } from './components/program-card/program-card.component';
import { ProgressionBadgeComponent } from './components/progression-badge/progression-badge.component';
import { SearchComponent } from './components/search/search.component';
import { StatusPillComponent } from './components/status-pill/status-pill.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TimePickerComponent } from './components/time-picker/time-picker.component';
import { ProgressionPillArrowPipe } from './helpers/progression-pill-arrow.pipe';
import { ProgressionPillPipe } from './helpers/progression-pill.pipe';
import { TeamColorPipe } from './helpers/team-color.pipe';
import { TrainingCardComponent } from './components/training-card/training-card.component';
import { ScoreFilterComponent } from './components/score-filter/score-filter.component';
import { ImgBadgeListComponent } from './components/img-badge-list/img-badge-list.component';

@NgModule({
  declarations: [
    ProgressionPillPipe,
    ProgressionPillArrowPipe,
    ProgramCardComponent,
    ProgressionBadgeComponent,
    ColoredPillListComponent,
    ImgBadgeComponent,
    AnchorNavigatorComponent,
    DropdownFilterComponent,
    StatusPillComponent,
    SearchComponent,
    TabsComponent,
    ProfileCardComponent,
    PeriodFilterComponent,
    ProgramCardListComponent,
    TimePickerComponent,
    TeamColorPipe,
    PaginationComponent,
    TrainingCardComponent,
    ScoreFilterComponent,
    ImgBadgeListComponent,
  ],
  imports: [
    CommonModule,
    TranslationModule,
    NgbNavModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    UtilsPipeModule,
    NgbPaginationModule,
    NgbTooltipModule,
    LoadingModule,
    RouterModule,
    NgbDatepickerModule,
    NgVar,
    AutoResizeTextareaDirective,
  ],
  exports: [
    TranslationModule,
    NgbNavModule,
    ProgramCardComponent,
    ProgressionBadgeComponent,
    ColoredPillListComponent,
    AnchorNavigatorComponent,
    DropdownFilterComponent,
    ProfileCardComponent,
    TabsComponent,
    SearchComponent,
    StatusPillComponent,
    PeriodFilterComponent,
    ProgramCardListComponent,
    TeamColorPipe,
    ProgressionPillPipe,
    ProgressionPillArrowPipe,
    NgVar,
    FormsModule,
    ImgBadgeComponent,
    ReactiveFormsModule,
    NgSelectModule,
    UtilsPipeModule,
    NgbPaginationModule,
    NgbTooltipModule,
    LoadingModule,
    NgbDatepickerModule,
    TimePickerComponent,
    PaginationComponent,
    AutoResizeTextareaDirective,
    TrainingCardComponent,
    ScoreFilterComponent,
    ImgBadgeListComponent,
  ],
})
export class SharedModule {}
