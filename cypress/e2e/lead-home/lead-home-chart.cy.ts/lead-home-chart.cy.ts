describe('Lead Home', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
  });

  it('Checks that chart component exists', () => {
    cy.get('[data-cy="chartBasicline"]').should('exist');
  });

  it('Should load chart', () => {
    cy.get('[data-cy="chartBasicline"]').find('canvas').should('exist');
  });
});
