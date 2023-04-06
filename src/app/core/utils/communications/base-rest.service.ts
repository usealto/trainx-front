import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer, Observable, of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { LoadingStore } from '../loading/loading.store';
import { RestConfig } from './rest.config';

export class JsonResponse {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };

  observe?: any = 'body';
  params?:
    | HttpParams
    | {
        [param: string]: string | string[];
      };
  reportProgress?: boolean;
  responseType: any = 'json';
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BaseRestService {
  load = 0;

  apiURL!: string;

  private getConfig!: RestConfig;
  private putConfig!: RestConfig;
  private postConfig!: RestConfig;
  private deleteConfig!: RestConfig;

  public set config(v: RestConfig[]) {
    this.getConfig = v.find((c) => c.type === 'GET') ?? { type: 'GET', responseType: 'json' };
    this.postConfig = v.find((c) => c.type === 'POST') ?? this.getConfig;
    this.putConfig = v.find((c) => c.type === 'PUT') ?? this.postConfig;
    this.deleteConfig = v.find((c) => c.type === 'DELETE') ?? this.getConfig;
  }

  public get separator(): string {
    if (this.apiURL) {
      return this.apiURL[this.apiURL.length - 1] === '/' ? '' : '/';
    }
    return '';
  }

  constructor(readonly http: HttpClient, readonly loadingStore: LoadingStore) {}

  get<T>(url: string, params?: { [param: string]: string | string[] }): Observable<T> {
    url = url.substring(0, 4) === 'http' ? url : this.apiURL + this.separator + url;
    return defer(() => {
      // Launches loader only when Observable is subscribed
      this.loadingStore.isLoading.value = true;
      this.load++;
      return of(this.load);
    }).pipe(
      switchMap(() => {
        const headers = this.getJsonHeaders(this.getConfig);
        if (params) {
          headers.params = params;
        }

        return this.http.get<T>(url, headers);
      }),
      finalize(() => {
        this.load--;
        this.loadingStore.isLoading.value = this.load > 0;
      }),
    );
  }

  post<T>(url: string, body: unknown) {
    return defer(() => {
      // Launches loader only when Observable is subscribed
      this.loadingStore.isLoading.value = true;
      this.load++;
      return of(this.load);
    }).pipe(
      switchMap(() => {
        return this.http.post<T>(
          this.apiURL + this.separator + url,
          body,
          this.getJsonHeaders(this.postConfig),
        );
      }),
      finalize(() => {
        this.load--;
        this.loadingStore.isLoading.value = this.load > 0;
      }),
    );
  }

  put<T>(url: string, body: unknown): Observable<T> {
    return defer(() => {
      // Launches loader only when Observable is subscribed
      this.loadingStore.isLoading.value = true;
      this.load++;
      return of(this.load);
    }).pipe(
      switchMap(() =>
        this.http.put<T>(this.apiURL + this.separator + url, body, this.getJsonHeaders(this.putConfig)),
      ),
      finalize(() => {
        this.load--;
        this.loadingStore.isLoading.value = this.load > 0;
      }),
    );
  }

  uploadFiles(url: string, formData: FormData) {
    return this.http.post(`${this.apiURL}${this.separator}${url}`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }

  private getJsonHeaders(config: RestConfig) {
    const j = new JsonResponse();
    j.responseType = config.responseType;
    j.observe = config.observe ?? 'body';

    j.headers = new HttpHeaders({ 'Content-Type': config.contentType ?? 'application/json' });
    if (config.token) {
      j.headers.append('Authorization', 'Bearer ' + config.token);
    }

    j.reportProgress = true;
    return j;
  }
}
