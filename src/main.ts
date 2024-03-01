/// <reference types="@angular/localize" />

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Sentry from '@sentry/angular-ivy';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  Sentry.init({
    dsn: environment.sentryDsn,
    environment: environment.sentryEnvironment,
    integrations: [
      new Sentry.BrowserTracing({
        // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
        tracePropagationTargets: [/^https:\/\/getcockpit\.io/],
      }),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: environment.sentryTracesSampleRate, //  Capture 100% of the transactions
    // Session Replay
    replaysSessionSampleRate: environment.sentryReplaysSessionSampleRate, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: environment.sentryReplaysOnErrorSampleRate, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
