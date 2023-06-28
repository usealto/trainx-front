describe('App Connection Admin', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');
  });

  it('Login', function () {
    cy.get('#welcome').contains('Bonjour E2e-admin');
    cy.get('#adminSwitch').should('exist');
  });

  it('Logout', function () {
    cy.get('.logout').click();
    cy.wait(1000);
    cy.url().should('not.include', Cypress.config().baseUrl);
  });
});

describe('App Connection', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username'), Cypress.env('auth_password'));
    cy.visit('/');
  });

  it('logs In', function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('#welcome').should('have.text', 'Bonjour E2e');
    /* ==== End Cypress Studio ==== */
    cy.get('#adminSwitch').should('not.exist');
  });

  it('logs out', function () {
    cy.get('.logout').click();
    cy.wait(1000);
    cy.url().should('not.include', Cypress.config().baseUrl);
  });
});
