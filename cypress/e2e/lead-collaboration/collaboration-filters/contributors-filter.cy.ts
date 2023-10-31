describe('Collaboration contributor filter', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});

    cy.get('[data-cy="leadMenuCollaboration"]').click();
    cy.get('[data-cy="main-div"]').find('alto-lead-collaboration', { timeout: 10000 });
  });

  it('Filters by collaborator', function () {
    cy.get('[data-cy="collaboratorName"]')
      .last()
      .then(($data) => {
        const contributor = $data.text().trim();
        cy.get('[data-cy="collaboratorFilter"]').click();

        cy.get('[data-cy="dropdownInput"]').clear();
        cy.get('[data-cy="dropdownInput"]').type(`${contributor}{enter}`);

        cy.wait(500);

        cy.get('[data-cy="contributionCard"]').first().should('contain.text', contributor);
      });
  });
});
