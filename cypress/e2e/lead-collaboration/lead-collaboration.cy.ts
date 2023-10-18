describe('Lead Collaboration', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
  });

  it('Access Lead Collaboration Page', function () {
    cy.get('[data-cy="leadMenuCollaboration"]').click();
    cy.get('[data-cy="leadCollaborationTitle"]').should('have.text', 'Collaboration');
  });
  // TODO WRITE A SWITCH TABS TEST
});
