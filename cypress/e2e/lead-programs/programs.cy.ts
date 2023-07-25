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

    it('Creates and delete a program', function () {
      cy.get('[ng-reflect-router-link="l/programs"]').click();
      cy.wait(500);
      cy.get('[data-cy="createNewProgram"]').click();

      // Create a new program
      cy.get(':nth-child(1) > .col-6 > .form-control').clear();
      cy.get(':nth-child(1) > .col-6 > .form-control').type('ABCDTEST');

      cy.get(':nth-child(5) > .col-6 > .alto-form > .ng-select-container > .ng-arrow-wrapper').click();
      cy.get('.ng-dropdown-panel-items .ng-option').first().click();

      cy.get(
        ':nth-child(9) > .col-6 > .alto-form > .ng-select-container > .ng-value-container > .ng-input > input',
      ).click();
      cy.get('.ng-dropdown-panel-items .ng-option').first().click();
      cy.get(':nth-child(3) > .text-end > .btn-primary').click();
      cy.get('.my-3 > .btn-primary').click();

      // Delete the program
      cy.get('[ng-reflect-router-link="l/programs"]').click();

      cy.get('.d-inline-block > .search-group > .form-control').clear();
      cy.get('.d-inline-block > .search-group > .form-control').type('ABCDTEST');
      cy.get('[data-cy="programABCDTEST"]').click();

      cy.get('[data-cy="deleteProgram"]').click();

      cy.get('.modal-body > .row > :nth-child(2) > .btn').click();

      // Check if the program is deleted
      cy.wait(500);
      cy.get('[ng-reflect-router-link="l/programs"]').click();

      cy.get('.d-inline-block > .search-group > .form-control').clear();
      cy.get('.d-inline-block > .search-group > .form-control').type('ABCDTEST');

      cy.get('[data-cy="programABCDTEST"]').should('not.exist');
    });
  });
});
