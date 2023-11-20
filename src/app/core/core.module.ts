import { InjectionToken, NgModule } from '@angular/core';
import { ActionReducerMap, StoreModule } from '@ngrx/store';

import { rootReducer } from './store/root/root.reducer';

import * as FromRoot from './store/root/root.reducer';

@NgModule({
  imports: [StoreModule.forRoot({ root: rootReducer })],
})
export class CoreModule {}
