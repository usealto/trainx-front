describe('Lead Programs', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');
  });

  it('Access Lead Programs Page', function () {
    cy.get('[ng-reflect-router-link="l/programs"]').click();
    cy.get('h1').should('have.text', 'Programmes');
  });

  it('Search Programs and check if title is right', () => {
    cy.get('[ng-reflect-router-link="l/programs"]').click();
    cy.wait(3000);

    cy.get(':nth-child(1) > alto-program-card > :nth-child(1) > .panel > .d-flex > .title').then(($data) => {
      const text = $data.text();
      cy.get('.d-inline-block > .search-group > .form-control').type(text);
      cy.wait(500);

      cy.get(':nth-child(1) > alto-program-card > :nth-child(1) > .panel > .d-flex > .title').should(
        'have.text',
        text,
      );
    });
  });

  it('Search Programs by description', function () {
    cy.get('[ng-reflect-router-link="l/programs"]').click();
    cy.wait(500);
    cy.get(':nth-child(2) > alto-program-card > :nth-child(1) > .panel').click();
    cy.wait(500);

    cy.get('[data-cy="descriptionField"]')
      .invoke('val')
      .then((data) => {
        const text = (data as string).slice(0, 10);
        cy.get('.mb-6 > .text-end > .btn-outline-secondary').click();
        cy.get('.d-inline-block > .search-group > .form-control').type(text).wait(500);
        cy.get(':nth-child(1) > alto-program-card > :nth-child(1) > .panel').click();
        cy.get('[data-cy="descriptionField"]').should('contain.value', text);
      });
  });

  it('filter programs by team', function () {
    cy.get('[ng-reflect-router-link="l/programs"]').click();
    cy.wait(500);

    cy.get(
      ':nth-child(2) > alto-program-card > :nth-child(1) > .panel > .card-bottom > [data-cy="coloredTeams"] > :nth-child(1)',
    ).then(($data) => {
      const teamShortname = $data.text();
      cy.get(
        '[data-cy="programTeamFilter"] > .ng-select-multiple > .ng-select-container > .ng-arrow-wrapper',
      ).click();
      cy.get('.ng-dropdown-header > input').type(`${teamShortname}{enter}`);

      cy.get('[data-cy="coloredTeams"]').first().contains(teamShortname);
    });
  });
});
