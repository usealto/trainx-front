describe('Collaboration type filter', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});

    cy.get('[data-cy="leadMenuCollaboration"]').click();
  });

  it('Filters by collaboration type', function () {
    cy.wait(500);

    cy.get('[data-cy="contributionType"]')
      .last()
      .then(($data) => {
        const contributionType = $data.text().trim();

        cy.get('[data-cy="typeFilter"]').click();

        cy.contains(contributionType).click();

        cy.wait(500);

        cy.get('[data-cy="contributionType"]').first().should('contain.text', contributionType);
      });
  });
});
