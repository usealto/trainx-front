describe('L/Teams Members Section', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
    cy.get('[data-cy="leadMenuTeams"]').click();
  });

  it('Filters members using search input', () => {
    cy.get('[data-cy="profileCard"] > .profile > .names-container > .email')
      .first()
      .click()
      .then(($data) => {
        const searchedText = $data.text().slice(0, 3);
        const text = $data.text();

        cy.get('[data-cy="filterBySearch"]').click();

        cy.get('.form-control').clear();
        cy.get('.form-control').type(`${searchedText}`);

        cy.get('[data-cy="profileCard"] > .profile > .names-container > .email')
          .first()
          .should('have.text', text);
      });
  });
});
