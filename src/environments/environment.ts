// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiURL: 'http://localhost:3000',
  auth0Domain: 'dev-bmttww5s.eu.auth0.com',
  auth0ClientId: 'ThcIBQZrRso5QaZq67kCU5eFYTfZwTSK',
  audience: 'https://api.usealto.com',
  slackAuthorization: 'https://staging-alto-slack-app-cinunhosha-od.a.run.app/slack/install?companyId=',
  applicationId: '5de36fd6-36c0-49ac-97bc-9e0517527d1c',
  googleChatAppURL: 'https://workspace.google.com/marketplace/app/alto/1076506336192',
  sentryDsn: 'https://1a9f0e07b9404c1ced5df9b98d821209@o4506417447174144.ingest.sentry.io/4506558380048384',
  sentryTracesSampleRate: 1.0,
  sentryReplaysSessionSampleRate: 0,
  sentryReplaysOnErrorSampleRate: 1.0,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
