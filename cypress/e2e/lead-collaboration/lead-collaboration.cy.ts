describe('Lead Collaboration', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/', {});
    cy.wait('@loadData');
  });

  it('Access Lead Collaboration Page', function () {
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.get('[data-cy="leadMenuCollaboration"]').click();
    cy.wait('@loadData');
    cy.get('[data-cy="leadCollaborationTitle"]').should('have.text', 'Contribution');
  });
});
