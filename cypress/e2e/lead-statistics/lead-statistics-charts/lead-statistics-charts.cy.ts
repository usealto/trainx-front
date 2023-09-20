describe('Lead Team', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
    cy.get('[data-cy="leadMenuStatistics"]').click().wait(500);
  });

  it('Checks that chart component exists', () => {
    cy.get('[data-cy="chartBasicline"]').should('exist');
  });

  it('Should load chart', () => {
    cy.get('[data-cy="chartBasicline"]').find('canvas').should('exist');
  });
});
