describe('Lead Team', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
  });

  it('Access Lead Statistics Page', function () {
    cy.get('[data-cy="leadMenuStatistics"]').click();
  });

  it('Should load statitics Page', () => {
    cy.get('[data-cy="leadStatisticsTitle"]').should('have.text', 'Statistiques');
  });
});
