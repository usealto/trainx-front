describe('Collaboration period filter', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/', {});
    cy.wait('@loadData');
  });

  it('Filters by period', function () {
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.get('[data-cy="leadMenuCollaboration"]').click();
    cy.wait('@loadData');

    cy.get('[data-cy="periodSeparator"]')
      .last()
      .then(($data) => {
        const period = $data.text().trim();

        cy.get('[data-cy="periodFilter"]').click();

        cy.contains(period).click();

        cy.wait(500);

        cy.get('[data-cy="periodSeparator"]').first().should('contain.text', period);
      });
  });
});
