import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { UserAccessGuard } from './guards/user-access.guard';
import { PreventSmallScreenGuard } from './guards/no-small-screen.guard';

import { reducers } from './store/store.reducer';

@NgModule({
  imports: [StoreModule.forRoot(reducers)],
  providers: [UserAccessGuard, PreventSmallScreenGuard],
})
export class CoreModule {}
