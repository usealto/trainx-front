import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Helpers } from '../utils/helpers';
import { LoadingStore } from '../utils/loading/loading.store';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  loadingThreshold = 15;
  constructor(private loadingStore: LoadingStore) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.nextHandle(next, request);
  }

  private nextHandle(next: HttpHandler, request: HttpRequest<any>): Observable<HttpEvent<any>> {
    this.loadingStore.isLoading.value = this.loadingStore.maxLoad > this.loadingThreshold;

    this.loadingStore.maxLoad++;

    const req =
    localStorage.getItem('impersonatedUser') && !request.url.includes('/auth/')
      ? request.clone({
          headers: request.headers.set(
            'x-impersonate-user-email',
            localStorage.getItem('impersonatedUser') ?? '',
          ),
        })
      : request;

    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          /** Transform ISO dates from the API in Date Objects */
          Helpers.JSONToDate(event.body);
        }
      }),
      finalize(() => {
        this.loadingStore.loaded += 2;

        if (this.loadingStore.loaded === this.loadingStore.maxLoad) {
          this.loadingStore.loaded = 0;
          this.loadingStore.maxLoad = 0;
        }

        this.loadingStore.isLoading.value = this.loadingStore.maxLoad > this.loadingThreshold;
      }),
    );
  }
}
