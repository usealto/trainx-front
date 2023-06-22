describe('App Connection Admin', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');
  });

  it('Login', function () {
    cy.get('#welcome').contains('Bonjour E2e-admin');
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('Logout', function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.logout').click();
    /* ==== End Cypress Studio ==== */
  });
});

describe('App Connection', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username'), Cypress.env('auth_password'));
    cy.visit('/');
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('Logout', function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.logout').click();
    /* ==== End Cypress Studio ==== */
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('Login', function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('#welcome').should('have.text', 'Bonjour E2e');
    /* ==== End Cypress Studio ==== */
  });
});
