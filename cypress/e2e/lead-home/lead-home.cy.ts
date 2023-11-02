describe('Lead Home', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/', {});
    cy.wait('@loadData');
  });

  it('Access Lead Home Page', function () {
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.get('[data-cy="leadMenuHome"]').click();
    cy.wait('@loadData');
  });

  it('Should load Home Page', () => {
    cy.get('[data-cy="main-div"]').find('alto-lead-home', { timeout: 10000 });
    cy.get('#welcome').should('contain.text', 'Bonjour E2e-admin');
  });
});
