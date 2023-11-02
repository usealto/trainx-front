describe('Lead Home', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/', {});
    cy.wait('@loadData');
  });

  it('Checks that chart component exists', () => {
    cy.get('[data-cy="main-div"]').find('alto-lead-home', { timeout: 10000 });
    cy.get('[data-cy="chartBasicline"]').should('exist');
  });

  it('Should load chart', () => {
    cy.get('[data-cy="main-div"]').find('alto-lead-home', { timeout: 10000 });
    cy.get('[data-cy="chartBasicline"]').find('canvas').should('exist');
  });
});
