import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MsgService } from '../message/msg.service';
import { ApiError } from '../models/api-error';
import { I18ns } from '../utils/i18n/I18n';

@Injectable({
  providedIn: 'root',
})
export class ApiErrorInterceptor implements HttpInterceptor {
  translationsMessages = I18ns.errors;

  constructor(private readonly msg: MsgService, private readonly authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((e: any) => {
        let apiError = new ApiError();
        const err = e.rejection ?? e;

        if (e instanceof HttpErrorResponse) {
          switch (e.status) {
            case 0: // API OFF
              apiError = {
                message: this.translationsMessages.ApiOff.message,
                title: this.translationsMessages.ApiOff.title,
                details: e.error?.details ?? '',
                level: 'error',
                err,
                handled: true,
                code: e.status,
              };
              break;
            case 200: // Model, Serialisation, etc. problem. Usually from front
              apiError = {
                message: e.message,
                title: this.translationsMessages.ClientError.title,
                details: e.error?.message ?? e.error?.error?.message,
                level: 'error',
                err,
                handled: true,
                code: e.status,
              };
              break;
            case 400: // bad request
              apiError = {
                message:
                  e.error.title ?? Array.isArray(e.error.message) ? e.error.message[0] : e.error.message,
                title: this.translationsMessages.BadParameters.title,
                details: e.error.detail,
                level: 'error',
                err,
                handled: true,
                code: e.status,
              };
              break;
            case 401: // authentification error
              // Auth0 is good but the API does not recognize you
              apiError = {
                message: this.translationsMessages.Unauthorized.message,
                title: this.translationsMessages.Unauthorized.title,
                details: e.statusText,
                level: 'error',
                err,
                handled: true,
                code: e.status,
              };
              // La 401 peut être causée par un token corrompu que angular ne peut pas détecter.
              this.authService
                .getAccessTokenSilently({
                  authorizationParams: {
                    audience: environment.audience,
                    scope: 'openid profile email offline_access',
                    redirect_uri: window.location.origin,
                  },
                })
                .subscribe();
              break;
            case 403: // right problem
              apiError = {
                message: this.translationsMessages.Forbiden.message,
                title: this.translationsMessages.Forbiden.title,
                details: e.error?.details ?? '',
                level: 'error',
                err,
                handled: true,
                code: e.status,
              };
              break;
            case 404: // not found
              apiError = {
                message: this.translationsMessages.Notfound.message,
                title: this.translationsMessages.Notfound.title,
                details: e.url ?? '',
                level: 'error',
                err,
                handled: true,
                code: e.status,
              };
              break;
            case 409: // Conflict on Data
              apiError = {
                message: e.message ?? e.error.message ?? '',
                title: this.translationsMessages.Conflict.title,
                level: 'error',
                err,
                handled: true,
                code: e.status,
              };
              break;
            case 429: // Too many requests
              apiError = {
                message: e.statusText,
                title: this.translationsMessages.OverLoad.title,
                level: 'error',
                err,
                handled: true,
                code: e.status,
              };
              break;
            case 500: // internal error
              apiError = {
                message: e.error.message,
                title: this.translationsMessages.ServerError.title,
                level: 'error',
                err,
                handled: true,
                code: e.status,
              };
              break;
            case 502: // bad gateway
              apiError = {
                message: this.translationsMessages.BadGateway.message,
                title: this.translationsMessages.BadGateway.title,
                details: e.error?.details ?? '',
                level: 'error',
                err,
                handled: true,
                code: e.status,
              };
              break;
            case 503: // service unavailable
              apiError = {
                message: this.translationsMessages.ServiceUnavailable.message,
                title: this.translationsMessages.ServiceUnavailable.title,
                details: e.error?.details ?? '',
                level: 'error',
                err,
                handled: true,
                code: e.status,
              };
              break;
            case 504: // time out
              apiError = {
                message: this.translationsMessages.Timeout.message,
                title: this.translationsMessages.Timeout.title,
                details: e.error?.details ?? '',
                level: 'error',
                err,
                handled: true,
                code: e.status,
              };
              break;
          }
        }

        this.msg.clear();
        this.msg.add({ title: apiError.title, message: apiError.message, severity: apiError.level });

        return throwError(() => apiError);
      }),
    );
  }
}
