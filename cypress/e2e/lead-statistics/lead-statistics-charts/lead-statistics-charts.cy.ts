describe('Lead Statistics', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/');
    cy.get('[data-cy="leadMenuStatistics"]').click();
    cy.wait('@loadData');
  });

  describe('Chart Basicline Teams', () => {
    it('Checks that chart component exists', () => {
      cy.get('[data-cy="chartBasicline"]').should('exist');
    });

    it('Should load chart', () => {
      cy.get('[data-cy="chartBasicline"]').find('canvas', { timeout: 10000 }).should('exist');
    });
  });

  describe('Chart Basicline Themes', () => {
    it('Checks that chart component exists', () => {
      cy.get('[data-cy="chartBasiclineThemes"]').should('exist');
    });

    it('Should load chart', () => {
      cy.get('[data-cy="chartBasiclineThemes"]').find('canvas', { timeout: 10000 }).should('exist');
    });
  });
});
