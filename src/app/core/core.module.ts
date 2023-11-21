import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { PreventSmallScreenGuard } from './guards/no-small-screen.guard';

import { reducers } from './store/store.reducer';

@NgModule({
  imports: [StoreModule.forRoot(reducers)],
  providers: [PreventSmallScreenGuard],
})
export class CoreModule {}
