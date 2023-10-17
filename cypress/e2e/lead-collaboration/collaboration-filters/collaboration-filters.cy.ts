describe('Lead Collaboration', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});

    cy.get('[data-cy="leadMenuCollaboration"]').click();
  });

  it.only('Filters by collaborator', function () {
    cy.wait(500);
    cy.get('[data-cy="collaboratorName"]')
      .last()
      .then(($data) => {
        const contributor = $data.text();
        cy.get('[data-cy="collaboratorFilter"]').click();

        cy.get('[data-cy="dropdownItems"]').children().should('have.text', contributor);
      });
  });

  it('Filters by collaboration type', function () {
    //TODO
  });

  it('Filters by period', function () {
    //TODO
  });
});
