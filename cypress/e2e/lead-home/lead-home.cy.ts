describe('Lead Home', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
  });

  it('Access Lead Home Page', function () {
    cy.get('[data-cy="leadMenuHome"]').click();
  });

  it('Should load Home Page', () => {
    cy.get('#welcome').should('contain.text', 'Bonjour E2e-admin');
  });
});
