import { ErrorHandler, Injectable, isDevMode } from '@angular/core';

@Injectable()
export class AppErrorHandler extends ErrorHandler {
  constructor() {
    super();
  }

  override handleError(error: any) {
    // Check for GET error
    const err = error && error.rejection ? error.rejection : error;

    if (isDevMode()) {
      super.handleError(error);
    }

    // Angular Errors
    if (error.error instanceof ErrorEvent || typeof err.status === 'undefined') {
      return;
    }

    // Les erreurs API doivent être gérées en amont !!!
    alert('Erreur Api non-gérée');
  }
}
