import { CanActivate, Router } from '@angular/router';
import { debounceTime, fromEvent, map, tap } from 'rxjs';
import { AltoRoutes } from '../../modules/shared/constants/routes';
import { Injectable } from '@angular/core';

let i = 0;

@Injectable()
export class PreventSmallScreenGuard implements CanActivate {
  constructor(private readonly router: Router) {}
  canActivate(): boolean {
    let isTooSmall = false;
    let tmpUrl = '';
    i++;
    if (i === 1) {
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(100),
          map(() => window.innerWidth > 745),
          tap((check) => {
            if (!check && !isTooSmall) {
              isTooSmall = true;
              tmpUrl = this.router.url;

              this.router.navigate(['/', AltoRoutes.noSmallScreen]);
            } else if (check && isTooSmall) {
              isTooSmall = false;
              this.router.navigate(
                tmpUrl === '/screen_too_small' || tmpUrl === ''
                  ? ['/', AltoRoutes.lead, AltoRoutes.userHome]
                  : [tmpUrl],
              );
              tmpUrl = '';
            }
          }),
        )
        .subscribe();
    }
    if (innerWidth < 745) {
      this.router.navigate(['/', AltoRoutes.noSmallScreen]);
    }

    return window.innerWidth > 745;
  }
}
