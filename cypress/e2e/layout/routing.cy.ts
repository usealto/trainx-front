describe('Lead Routing', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');
  });

  it('Access Lead Home from root redirects to Home', function () {
    cy.url().should('include', 'l/home');
  });

  it('Access Lead Home from /l redirects to Home', function () {
    cy.visit('/l');

    cy.url().should('include', 'l/home');
  });
});

describe('User Routing', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username'), Cypress.env('auth_password'));
    cy.visit('/');
  });
  it('Access User Home from root redirects to Home', function () {
    cy.url().should('include', 'u/home');
  });

  it('Access User Home from /u redirects to Home', function () {
    cy.visit('/u');

    cy.url().should('include', 'u/home');
  });

  it('displays the 404 page', function () {
    cy.visit('/3q5s4d6ws5d4fwxfc');
    cy.url().should('contains', '/404');
  });
});
