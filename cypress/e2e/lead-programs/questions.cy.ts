describe('Lead Questions', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');

    cy.get('[ng-reflect-router-link="l/programs"]').click();
  });

  it('Access Lead Programs Page Questions Section', function () {
    cy.get('h1').should('have.text', 'Programmes');
  });

  it('Search Questions and check if title is right', () => {
    cy.get('#questionsAnchor').should('have.text', 'Questions');
  });

  it('filter questions by program', () => {
    cy.get('#questionsAnchor').should('have.text', 'Questions');

    cy.get('[data-cy="questionsProgramFilter"]').click();

    cy.get('.ng-dropdown-header > input').clear();
    cy.get('.ng-dropdown-header > input').type('cypress{enter}');

    cy.get('[data-cy="questionsTableProgramCol"]').should('have.text', 'Programmes');

    /* ==== Generated with Cypress Studio ==== */
    cy.get(':nth-child(1) > :nth-child(4) > alto-colored-pill-list > :nth-child(1)').should(
      'have.text',
      'Cypress Test',
    );
    /* ==== End Cypress Studio ==== */
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

  it('filter questions by contributor', () => {
    cy.get('#questionsAnchor').should('have.text', 'Questions');

    cy.get('[data-cy="questionsContributorFilter"]').click();

    cy.get('.ng-dropdown-header > input').clear();
    cy.get('.ng-dropdown-header > input').type('romain{enter}');

    cy.get('[data-cy="questionsTableContributorCol"]').should('have.text', 'Ajoutée par');
    /* ==== Generated with Cypress Studio ==== */
    cy.get(
      '.questions > .table-panel > .table > tbody > :nth-child(1) > .text-center > alto-img-badge > img',
    ).should(
      'have.attr',
      'src',
      'https://s.gravatar.com/avatar/0989ee1d5d2827fad81a7082283ed8b6?s=32&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fro.png',
    );
    /* ==== End Cypress Studio ==== */
  });

  it('search questions by word', () => {
    cy.get('#questionsAnchor').should('have.text', 'Questions');

    cy.get('[data-cy="questionsSearchFilter"]').click().type('chocolatine{enter}');
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.w-40').contains('Chocolatine');
    /* ==== End Cypress Studio ==== */
  });
});
