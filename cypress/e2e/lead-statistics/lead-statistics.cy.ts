describe('Lead Statistics', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/');
    cy.wait('@loadData');
  });

  it('Access Lead Statistics Page', function () {
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.get('[data-cy="leadMenuStatistics"]').click();
    cy.wait('@loadData');

    cy.get('[data-cy="leadStatisticsTitle"]').should('have.text', 'Statistiques');
  });
});
