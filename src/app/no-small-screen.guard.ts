// import { inject } from '@angular/core';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { debounceTime, fromEvent, map, tap } from 'rxjs';
import { AltoRoutes } from './modules/shared/constants/routes';

let i = 0;

export const noSmallScreen: CanActivateFn = () => {
  const router = inject(Router);

  let tmpUrl = '';
  let isTooSmall = false;
  i++;

  if (i === 1) {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(100),
        map((event) => window.innerWidth > 745),
        tap((check) => {
          if (!check && !isTooSmall) {
            isTooSmall = true;
            tmpUrl = router.url;

            //TODO replace by proper location

            router.navigate(['/', AltoRoutes.noAccess]);
          } else if (check && isTooSmall) {
            isTooSmall = false;
            router.navigate([tmpUrl]);
            tmpUrl = '';
          }
        }),
      )
      .subscribe();
  }

  if (innerWidth < 745) {
    //TODO replace by proper location

    router.navigate(['/', AltoRoutes.noAccess]);
  }

  return window.innerWidth > 745;
};
