describe('Lead Routing', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/');
    cy.wait('@loadData');
  });

  it('Access Lead Home from root redirects to Home', () => {
    cy.wait('@loadData');
    cy.url().should('include', 'l/home');
  });

  it('Access Lead Home from /l redirects to Home', () => {
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/l');
    cy.wait('@loadData');

    cy.url().should('include', 'l/home');
  });
});

describe('User Routing', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username'), Cypress.env('auth_password'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/');
    cy.wait('@loadData');
  });

  it('Access User Home from root redirects to Home', () => {
    cy.wait('@loadData');
    cy.url().should('include', 'u/home');
  });

  it('Access User Home from /u redirects to Home', () => {
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/u');
    cy.wait('@loadData');

    cy.url().should('include', 'u/home');
  });

  it('displays the 404 page', () => {
    cy.visit('/3q5s4d6ws5d4fwxfc');
    cy.url().should('contains', '/404');
  });
});
