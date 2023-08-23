describe('L/Programs Questions Tab', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');

    cy.get('[ng-reflect-router-link="l/programs"]').click();
  });

  it('filter questions by tag', () => {
    cy.get('#questionsAnchor').should('have.text', 'Questions');

    cy.get('[data-cy="questionsTagFilter"]').click();
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.ng-dropdown-header > input').clear();
    cy.get('.ng-dropdown-header > input').type('cypress{enter}');

    cy.get('[data-cy="questionsTableTagCol"]').should('have.text', 'Tags');
    cy.get(':nth-child(3) > alto-colored-pill-list > .alto-badge').should('have.text', 'Cypress Tag');
    /* ==== End Cypress Studio ==== */
  });
});
