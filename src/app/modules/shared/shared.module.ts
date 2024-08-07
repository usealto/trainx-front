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
import { QuestionFormComponent } from '../programs/components/create-questions/question-form.component';
import { AnchorNavigatorComponent } from './components/anchor-navigator/anchor-navigator.component';
import { ColoredPillListComponent } from './components/colored-pill/colored-pill-list.component';
import { DeleteModalComponent } from './components/delete-modal/delete-modal.component';
import { DropdownFilterComponent } from './components/dropdown-filter/dropdown-filter.component';
import { InputMultipleSelectComponent } from './components/forms/input-multiple-select/input-multiple-select.component';
import { InputPillsComponent } from './components/forms/input-pills/input-pills.component';
import { InputRangeComponent } from './components/forms/input-range/input-range.component';
import { InputSearchComponent } from './components/forms/input-search/input-search.component';
import { InputSingleSelectPillComponent } from './components/forms/input-single-select-pill/input-single-select-pill.component';
import { InputSingleSelectComponent } from './components/forms/input-single-select/input-single-select.component';
import { InputTextComponent } from './components/forms/input-text/input-text.component';
import { InputToggleComponent } from './components/forms/input-toggle/input-toggle.component';
import { IconBadgeComponent } from './components/icon-badge/icon-badge.component';
import { ImgBadgeListComponent } from './components/img-badge-list/img-badge-list.component';
import { ImgBadgeComponent } from './components/img-badge/img-badge.component';
import { ImpersonationHeaderComponent } from './components/impersonation-header/impersonation-header.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { PeriodFilterComponent } from './components/period-filter/period-filter.component';
import { PlaceholderManagerComponent } from './components/placeholder-manager/placeholder-manager.component';
import { ProfileCardComponent } from './components/profile-card/profile-card.component';
import { ProgressionBadgeComponent } from './components/progression-badge/progression-badge.component';
import { ProgressionFilterComponent } from './components/progression-filter/progression-filter.component';
import { QuestionDeleteModalComponent } from './components/question-delete-modal/question-delete-modal.component';
import { ScoreFilterComponent } from './components/score-filter/score-filter.component';
import { SearchComponent } from './components/search/search.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TextCounterComponent } from './components/text-counter/text-counter.component';
import { TimePickerComponent } from './components/time-picker/time-picker.component';
import { TrainingCardComponent } from './components/training-card/training-card.component';
import { ProgressionPillArrowPipe } from './helpers/progression-pill-arrow.pipe';
import { ProgressionPillPipe } from './helpers/progression-pill.pipe';
import { TeamColorPipe } from './helpers/team-color.pipe';
import { InputButtonGroupComponent } from './components/forms/input-button-group/input-button-group.component';
import { LoadSpinnerComponent } from './components/load-spinner/load-spinner.component';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';
import { DropdownFilterSingleComponent } from './components/dropdown-filter-single/dropdown-filter-single.component';
import { QuestionImageModalComponent } from './components/question-image-modal/question-image-modal.component';
@NgModule({
  declarations: [
    ProgressionPillPipe,
    ProgressionPillArrowPipe,
    ProgressionBadgeComponent,
    ColoredPillListComponent,
    ImgBadgeComponent,
    AnchorNavigatorComponent,
    DropdownFilterComponent,
    SearchComponent,
    TabsComponent,
    ProfileCardComponent,
    PeriodFilterComponent,
    TimePickerComponent,
    TeamColorPipe,
    PaginationComponent,
    TrainingCardComponent,
    ScoreFilterComponent,
    ProgressionFilterComponent,
    ImgBadgeListComponent,
    InputButtonGroupComponent,
    TextCounterComponent,
    QuestionDeleteModalComponent,
    IconBadgeComponent,
    DeleteModalComponent,
    LeaderboardComponent,
    PlaceholderManagerComponent,
    QuestionFormComponent,
    ImpersonationHeaderComponent,
    InputTextComponent,
    InputPillsComponent,
    InputSearchComponent,
    InputMultipleSelectComponent,
    InputSingleSelectPillComponent,
    InputToggleComponent,
    InputSingleSelectComponent,
    InputRangeComponent,
    LoadSpinnerComponent,
    ConfirmModalComponent,
    DropdownFilterSingleComponent,
    QuestionImageModalComponent,
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
    ProgressionBadgeComponent,
    ColoredPillListComponent,
    AnchorNavigatorComponent,
    DropdownFilterComponent,
    ProfileCardComponent,
    TabsComponent,
    SearchComponent,
    PeriodFilterComponent,
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
    InputButtonGroupComponent,
    TextCounterComponent,
    QuestionDeleteModalComponent,
    EmojiPipe,
    DeleteModalComponent,
    LeaderboardComponent,
    PlaceholderManagerComponent,
    QuestionFormComponent,
    ImpersonationHeaderComponent,
    InputTextComponent,
    InputPillsComponent,
    InputSearchComponent,
    InputMultipleSelectComponent,
    InputSingleSelectPillComponent,
    InputToggleComponent,
    InputSingleSelectComponent,
    InputRangeComponent,
    LoadSpinnerComponent,
    ConfirmModalComponent,
    DropdownFilterSingleComponent,
  ],
  providers: [NgbActiveModal],
})
export class SharedModule {
  constructor(private config: NgSelectConfig) {
    this.config.notFoundText = I18ns.shared.textNotFound;
  }
}
