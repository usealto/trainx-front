describe('Lead Statistics Engagement', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
  });

  it('Access Lead Statistics Engagement Page', () => {
    cy.get('[data-cy="leadMenuStatistics"]').click();

    cy.get('[data-cy="leadStatisticsTitle"]').should('have.text', 'Statistiques');
  });
});
