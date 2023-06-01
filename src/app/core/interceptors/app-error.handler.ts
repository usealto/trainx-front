import { ErrorHandler, Injectable, isDevMode } from '@angular/core';

@Injectable()
export class AppErrorHandler extends ErrorHandler {
  constructor() {
    super();
  }

  override handleError(error: any) {
    // Check for GET error
    const err = error && error.rejection ? error.rejection : error;

    // Auth0 403
    if (err.error === 'invalid_grant' && err.error_description === 'Unknown or invalid refresh token.') {
      console.log('refresh token error');
      localStorage.clear();
    }

    if (isDevMode()) {
      super.handleError(error);
    }

    // Angular Errors
    if (error.error instanceof ErrorEvent || typeof err.status === 'undefined') {
      return;
    }

    // Les erreurs API doivent être gérées en amont !!!
    console.log('Erreur Api non-gérée');
  }
}
