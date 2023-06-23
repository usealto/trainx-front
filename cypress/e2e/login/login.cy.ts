describe('App Connection Admin', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');
  });

  it('Login', function () {
    cy.get('#welcome').contains('Bonjour E2e-admin');
  });

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

  it('Login', function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('#welcome').should('have.text', 'Bonjour E2e');
    /* ==== End Cypress Studio ==== */
    cy.get('#adminSwitch').should('not.exist');
  });

  it('Logout', function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.logout').click();
    /* ==== End Cypress Studio ==== */
  });
});
