describe('Collaboration type filter', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/', {});
    cy.wait('@loadData');
  });

  it('Filters by collaboration type', function () {
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.get('[data-cy="leadMenuCollaboration"]').click();
    cy.wait('@loadData');

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
