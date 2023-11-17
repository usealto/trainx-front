import { ResolveFn } from '@angular/router';

export const noSplashScreenResolver: ResolveFn<any> = () => {
  document.getElementsByClassName('first-loader').item(0)?.remove();
};
