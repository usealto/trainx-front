// import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';

export const noSmallScreen: CanActivateFn = () => {
  // const router = inject(Router);
  function DetectResize() {
    console.log('TEST', window.innerWidth);
    if (innerWidth < 840) {
      console.log('you`re in');
      // TODO redirectiion to the proper page
      // router.navigate(['/', AltoRoutes.noAccess]);
    }
  }

  window.onresize = DetectResize;

  return true;
};
