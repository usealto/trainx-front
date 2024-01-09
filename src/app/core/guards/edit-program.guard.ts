import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import * as FromRoot from '../store/store.reducer';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';

@Injectable({
  providedIn: 'root',
})
export class EditProgramGuard implements CanActivate {
  constructor(private store: Store<FromRoot.AppState>, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const programId = route.paramMap.get('id');

    return this.store.select(FromRoot.selectCompany).pipe(
      map(({ data: company }) => {
        const programExists = company.programs.some((program) => program.id === programId);

        if (!programExists) {
          this.router.navigate(['/', AltoRoutes.lead, AltoRoutes.programs]);
          return false;
        }

        return true;
      }),
    );
  }
}
