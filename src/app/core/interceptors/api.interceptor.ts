import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Helpers } from '../utils/helpers';
import { LoadingStore } from '../utils/loading/loading.store';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private loadingStore: LoadingStore) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.nextHandle(next, request);
  }

  private nextHandle(next: HttpHandler, request: HttpRequest<any>): Observable<HttpEvent<any>> {
    this.loadingStore.isLoading.value = this.loadingStore.maxLoad > 15;

    this.loadingStore.maxLoad++;

    return next.handle(request).pipe(
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

        this.loadingStore.isLoading.value = this.loadingStore.maxLoad > 15;
      }),
    );
  }
}
