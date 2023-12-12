import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';

import { PreventSmallScreenGuard } from './guards/no-small-screen.guard';

import { reducers } from './store/store.reducer';
import { ResolversService } from './resolvers/resolvers.service';

@NgModule({
  imports: [StoreModule.forRoot(reducers)],
  providers: [PreventSmallScreenGuard, ResolversService],
})
export class CoreModule {}
