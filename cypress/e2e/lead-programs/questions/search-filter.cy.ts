describe('L/Programs Questions Tab', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');

    cy.get('[ng-reflect-router-link="l/programs"]').click();
  });

  it('search questions by word', () => {
    cy.get('#questionsAnchor').should('have.text', 'Questions');

    cy.get('[data-cy="questionsSearchFilter"]').click().type('chocolatine{enter}');
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.w-40').contains('Chocolatine');
    /* ==== End Cypress Studio ==== */
  });
});
