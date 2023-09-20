describe('Lead Statistics', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
    cy.get('[data-cy="leadMenuStatistics"]').click().wait(500);
  });

  describe('Chart Basicline Teams', () => {
    it('Checks that chart component exists', () => {
      cy.get('[data-cy="chartBasicline"]').should('exist');
    });

    it('Should load chart', () => {
      cy.get('[data-cy="chartBasicline"]').find('canvas').should('exist');
    });
  });

  describe('Chart Basicline Themes', () => {
    it('Checks that chart component exists', () => {
      cy.get('[data-cy="chartBasiclineThemes"]').should('exist');
    });

    it('Should load chart', () => {
      cy.get('[data-cy="chartBasiclineThemes"]').find('canvas').should('exist');
    });
  });

  describe('Bar Chart', () => {
    it('Checks that chart component exists', () => {
      cy.get('[data-cy="barChart"]').should('exist');
    });

    it('Should load chart', () => {
      cy.get('[data-cy="barChart"]').find('canvas').should('exist');
    });
  });
});
