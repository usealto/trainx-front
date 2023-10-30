describe('Lead Programs', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/');
    cy.wait('@loadData');
  });

  it('Access Lead Programs Page', function () {
    cy.get('[data-cy="leadMenuPrograms"]').click();
    cy.wait(500);

    cy.get('[data-cy="main-div"]').find('alto-programs', { timeout: 10000 });

    cy.get('h1').should('have.text', 'Programmes');
  });

  it('Search Programs and check if title is right', () => {
    cy.get('[data-cy="leadMenuPrograms"]').click();
    cy.wait(500);

    cy.get('[data-cy="main-div"]').find('alto-programs', { timeout: 10000 });

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
