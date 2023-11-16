import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ApiModule, BASE_PATH } from '@usealto/sdk-ts-angular';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { ApiErrorInterceptor } from './core/interceptors/api-error.interceptor';
import { ApiInterceptor } from './core/interceptors/api.interceptor';
import { AppErrorHandler } from './core/interceptors/app-error.handler';
import { MsgModule } from './core/message/msg.module';
import { ToastComponent } from './core/toast/toast.component';
import { LocaleService, localeIdFactory, localeInitializer } from './core/utils/i18n/locale.service';
import { TranslationModule } from './core/utils/i18n/translation.module';
import { LoadingModule } from './core/utils/loading/loading.module';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { AppComponent } from './layout/app/app.component';
import { JwtComponent } from './layout/jwt/jwt.component';
import { MenuComponent } from './layout/menu/menu.component';
import { NoCompanyComponent } from './layout/no-company/no-company.component';
import { NoSmallScreenComponent } from './layout/no-small-screen/no-small-screen.component';
import { NoTeamComponent } from './layout/no-team/no-team.component';
import { NoWebAccessComponent } from './layout/no-web-access/no-web-access.component';
import { NotFoundComponent } from './layout/not-found/not-found.component';
import { TestComponent } from './layout/test/test.component';
import { SharedModule } from './modules/shared/shared.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ImpersonateComponent } from './layout/impersonate/impersonate.component';
@NgModule({
  declarations: [
    AppComponent,
    AppLayoutComponent,
    MenuComponent,
    NotFoundComponent,
    TestComponent,
    JwtComponent,
    NoWebAccessComponent,
    NoCompanyComponent,
    NoTeamComponent,
    NoSmallScreenComponent,
    ImpersonateComponent,
  ],
  imports: [
    ApiModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
    NgSelectModule,
    LoadingModule,
    TranslationModule,
    SharedModule,
    MsgModule,
    AuthModule.forRoot({
      domain: environment.auth0Domain,
      clientId: environment.auth0ClientId,
      useRefreshTokens: true,
      cacheLocation: 'localstorage',
      authorizationParams: {
        audience: environment.audience,
        scope: 'openid profile email offline_access',
        redirect_uri: window.location.origin,
      },
      httpInterceptor: {
        allowedList: [`${environment.apiURL}/*`],
      },
    }),
    ToastComponent,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true,
    },
    {
      provide: BASE_PATH,
      useValue: environment.apiURL,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: AppErrorHandler,
    },
    { provide: LOCALE_ID, useFactory: localeIdFactory, deps: [LocaleService] },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: localeInitializer,
      deps: [LOCALE_ID],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
