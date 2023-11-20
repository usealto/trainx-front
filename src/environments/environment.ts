// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiURL: 'https://trainx-api-develop.usealto.com',
  auth0Domain: 'dev-bmttww5s.eu.auth0.com',
  auth0ClientId: 'ThcIBQZrRso5QaZq67kCU5eFYTfZwTSK',
  audience: 'https://api.usealto.com',
  // audience: 'https://dev-bmttww5s.eu.auth0.com/api/v2',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
