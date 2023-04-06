import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReplaceInTranslationPipe } from './replace-in-translation.pipe';
import { PluralPipe } from './plural.pipe';
import { RouterModule, Routes } from '@angular/router';
import { I18nEditorComponent } from './i18n-editor/i18n-editor.component';

const routes: Routes = [
  {
    path: '',
    component: I18nEditorComponent,
  },
];

@NgModule({
  declarations: [ReplaceInTranslationPipe, PluralPipe, I18nEditorComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [ReplaceInTranslationPipe, PluralPipe],
  providers: [],
})
export class TranslationModule {}
