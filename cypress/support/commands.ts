// ***********************************************
// This example namespace declaration will help
// with Intellisense and code completion in your
// IDE or Text Editor.
// ***********************************************
// declare namespace Cypress {
//   interface Chainable<Subject = any> {
//     customCommand(param: any): typeof customCommand;
//   }
// }
//
// function customCommand(param: any): void {
//   console.warn(param);
// }
//
// NOTE: You can use it like so:
// Cypress.Commands.add('customCommand', customCommand);
//
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // interface cy {
  // declare additional properties on "cy" object, like
  // label: string
  // }
  interface Chainable {
    // declare additional custom commands as methods, like
    loginToAuth0(username: string, password: string): any;
  }
}

function loginViaAuth0Ui(username: string, password: string) {
  // App landing page redirects to Auth0.
  cy.visit('/');
  // Login on Auth0.
  cy.origin(Cypress.env('auth_url'), { args: { username, password } }, ({ username, password }) => {
    cy.get('input#username').type(username);
    cy.get('input#password').type(password, { log: false });
    cy.get('button[name=action]').last().click();
  });
}

Cypress.Commands.add('loginToAuth0', (username: string, password: string) => {
  const log = Cypress.log({
    displayName: 'AUTH0 LOGIN',
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  });
  log.snapshot('before');

  cy.session(
    `auth0-${username}`,
    () => {
      loginViaAuth0Ui(username, password);
    },
    {
      validate: () => {
        // Validate presence of access token in localStorage.
        cy.wrap(localStorage)
          .invoke('getItem', '@@auth0spajs@@::' + Cypress.env('auth_client_id') + '::@@user@@')
          .should('exist');
      },
    },
  );

  log.snapshot('after');
  log.end();
});
