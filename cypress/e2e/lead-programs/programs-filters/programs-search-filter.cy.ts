describe('Lead Programs', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');
  });

  it('Access Lead Programs Page', function () {
    cy.get('[href="/l/programs"]').click();
    cy.get('h1').should('have.text', 'Programmes');
  });

  it('Search Programs and check if title is right', () => {
    cy.get('[href="/l/programs"]').click();
    cy.wait(500);

    cy.get('[data-cy="programCard"] > .panel > .title')
      .eq(1)
      .then(($data) => {
        const text = $data.text();
        cy.get('[data-cy="programSearch"]').type(text);
        cy.wait(500);

        cy.get('[data-cy="programCardList"]')
          .children()
          .eq(1)
          .within(() => {
            cy.get(`[data-cy="program${text}"]`);
          });
      });
  });
});
