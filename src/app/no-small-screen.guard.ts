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

            router.navigate(['/', AltoRoutes.noSmallScreen]);
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
    router.navigate(['/', AltoRoutes.noSmallScreen]);
  }

  return window.innerWidth > 745;
};
