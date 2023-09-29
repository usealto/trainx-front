import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NgbActiveModal,
  NgbDatepickerModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbProgressbarModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectConfig, NgSelectModule } from '@ng-select/ng-select';
import { AutoResizeTextareaDirective } from 'src/app/core/utils/directives/auto-resize-textarea.directive';
import { NgVar } from 'src/app/core/utils/directives/ng-var.directive';
import { EmojiPipe } from 'src/app/core/utils/emoji/emoji.pipe';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { TranslationModule } from 'src/app/core/utils/i18n/translation.module';
import { LoadingModule } from 'src/app/core/utils/loading/loading.module';
import { UtilsPipeModule } from 'src/app/core/utils/pipe/utils-pipe.module';
import { AnchorNavigatorComponent } from './components/anchor-navigator/anchor-navigator.component';
import { ButtonGroupComponent } from './components/button-group/button-group.component';
import { ColoredPillListComponent } from './components/colored-pill/colored-pill.component';
import { DeleteModalComponent } from './components/delete-modal/delete-modal.component';
import { DropdownFilterComponent } from './components/dropdown-filter/dropdown-filter.component';
import { IconBadgeComponent } from './components/icon-badge/icon-badge.component';
import { ImgBadgeListComponent } from './components/img-badge-list/img-badge-list.component';
import { ImgBadgeComponent } from './components/img-badge/img-badge.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { PeriodFilterComponent } from './components/period-filter/period-filter.component';
import { ProfileCardComponent } from './components/profile-card/profile-card.component';
import { ProgramCardListComponent } from './components/program-card-list/program-card-list.component';
import { ProgramCardComponent } from './components/program-card/program-card.component';
import { ProgressionBadgeComponent } from './components/progression-badge/progression-badge.component';
import { ProgressionFilterComponent } from './components/progression-filter/progression-filter.component';
import { QuestionDeleteModalComponent } from './components/question-delete-modal/question-delete-modal.component';
import { RangeComponent } from './components/range/range.component';
import { ScoreFilterComponent } from './components/score-filter/score-filter.component';
import { SearchComponent } from './components/search/search.component';
import { StatusPillComponent } from './components/status-pill/status-pill.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TextCounterComponent } from './components/text-counter/text-counter.component';
import { TimePickerComponent } from './components/time-picker/time-picker.component';
import { TopFlopComponent } from './components/top-flop/top-flop.component';
import { TrainingCardComponent } from './components/training-card/training-card.component';
import { ProgressionPillArrowPipe } from './helpers/progression-pill-arrow.pipe';
import { ProgressionPillPipe } from './helpers/progression-pill.pipe';
import { TeamColorPipe } from './helpers/team-color.pipe';
import { PlaceholderManagerComponent } from './components/placeholder-manager/placeholder-manager.component';

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
    ProgressionFilterComponent,
    ImgBadgeListComponent,
    ButtonGroupComponent,
    TextCounterComponent,
    QuestionDeleteModalComponent,
    TopFlopComponent,
    IconBadgeComponent,
    DeleteModalComponent,
    RangeComponent,
    PlaceholderManagerComponent,
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
    NgbProgressbarModule,
    AutoResizeTextareaDirective,
    EmojiPipe,
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
    IconBadgeComponent,
    ReactiveFormsModule,
    NgbProgressbarModule,
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
    ProgressionFilterComponent,
    ImgBadgeListComponent,
    ButtonGroupComponent,
    TextCounterComponent,
    QuestionDeleteModalComponent,
    EmojiPipe,
    TopFlopComponent,
    RangeComponent,
    DeleteModalComponent,
    PlaceholderManagerComponent,
  ],
  providers: [NgbActiveModal],
})
export class SharedModule {
  constructor(private config: NgSelectConfig) {
    this.config.notFoundText = I18ns.shared.textNotFound;
  }
}
