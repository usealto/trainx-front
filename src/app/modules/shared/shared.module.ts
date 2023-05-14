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
import { TranslationModule } from 'src/app/core/utils/i18n/translation.module';
import { LoadingModule } from 'src/app/core/utils/loading/loading.module';
import { UtilsPipeModule } from 'src/app/core/utils/pipe/utils-pipe.module';
import { ColoredPillListComponent } from './components/colored-pill/colored-pill.component';
import { ProgramCardComponent } from './components/program-card/program-card.component';
import { ProgressionBadgeComponent } from './components/progression-badge/progression-badge.component';
import { ImgBadgeComponent } from './components/img-badge/img-badge.component';
import { AnchorNavigatorComponent } from './components/anchor-navigator/anchor-navigator.component';
import { DropdownFilterComponent } from './components/dropdown-filter/dropdown-filter.component';
import { StatusPillComponent } from './components/status-pill/status-pill.component';
import { SearchComponent } from './components/search/search.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { ProfileCardComponent } from './components/profile-card/profile-card.component';
import { NgVar } from 'src/app/core/utils/directives/ng-var.directive';
import { PeriodFilterComponent } from './components/period-filter/period-filter.component';
import { DropzoneComponent } from './components/dropzone/dropzone.component';
import { CustomPaginationComponent } from './components/custom-pagination/custom-pagination.component';

@NgModule({
  declarations: [
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
    DropzoneComponent,
    CustomPaginationComponent,
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
    DropzoneComponent,
    CustomPaginationComponent,
  ],
})
export class SharedModule {}
