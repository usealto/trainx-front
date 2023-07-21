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
    cy.wait(3000);

    cy.get(
      '.col-7 > alto-dropdown-filter > .ng-select-multiple > .ng-select-container > .ng-arrow-wrapper',
    ).click();
    cy.get('.ng-dropdown-panel-items .ng-option').contains('ABD').click();
    cy.get(
      '.col-7 > alto-dropdown-filter > .ng-select-multiple > .ng-select-container > .ng-arrow-wrapper',
    ).click();
    cy.get(
      ':nth-child(1) > alto-program-card > :nth-child(1) > .panel > .card-bottom > alto-colored-pill-list > span',
    ).contains('ABD');
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

  it('create and delete a program', function () {
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

    cy.wait(500);

    cy.get('[data-cy="deleteProgram"]').click();

    cy.wait(500);

    cy.get('.modal-body > .row > :nth-child(2) > .btn').click();

    // Check if the program is deleted
    cy.wait(500);
    cy.get('[ng-reflect-router-link="l/programs"]').click();

    cy.get('.d-inline-block > .search-group > .form-control').clear();
    cy.get('.d-inline-block > .search-group > .form-control').type('ABCDTEST');

    cy.get('[data-cy="programABCDTEST"]').should('not.exist');
  });

  it('create and edit a program while testing all cases of question creation', function () {
    cy.get('[ng-reflect-router-link="l/programs"]').click();
    cy.wait(500);
    cy.get('[data-cy="createNewProgram"]').click();

    // Create a new program
    cy.get(':nth-child(1) > .col-6 > .form-control').clear();
    cy.get(':nth-child(1) > .col-6 > .form-control').type('ABCDETEST');

    cy.get(':nth-child(5) > .col-6 > .alto-form > .ng-select-container > .ng-arrow-wrapper').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();

    cy.get(
      ':nth-child(9) > .col-6 > .alto-form > .ng-select-container > .ng-value-container > .ng-input > input',
    ).click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();
    cy.get(':nth-child(3) > .text-end > .btn-primary').click();

    cy.get('input[type="checkbox"]').eq(1).click();
    // Create a new question
    cy.get('[data-cy="createNewQuestion"]').click();
    cy.get('[ng-reflect-placeholder="Intitulé de la question"] > .form-control').type('testqst');
    cy.get(':nth-child(4) > .flex-grow-1 > .form-control').type('bonjout');
    cy.get(':nth-child(8) > .flex-grow-1 > .form-control').type('aurevoir');
    cy.get('.ng-invalid > .ng-select-container > .ng-value-container > .ng-input > input').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();
    cy.get('.button-container > .btn-primary').click();
    cy.wait(500);

    // Check if the question is created and if the checkbox is checked
    cy.get('input[type="checkbox"]:checked').should('have.length', 3);

    // Create a new question with a different tag
    cy.get('[data-cy="createNewQuestion"]').click();
    cy.get('[ng-reflect-placeholder="Intitulé de la question"] > .form-control').type('testqst2');
    cy.get(':nth-child(4) > .flex-grow-1 > .form-control').type('bonjout');
    cy.get(':nth-child(8) > .flex-grow-1 > .form-control').type('aurevoir');
    cy.get('.ng-invalid > .ng-select-container > .ng-value-container > .ng-input > input').click();
    cy.get('.ng-dropdown-panel-items .ng-option').eq(1).click();
    cy.get('.button-container > .btn-primary').click();
    cy.wait(500);

    // Check if the question is NOT displayed because of the different tag
    cy.get('input[type="checkbox"]:checked').should('have.length', 3);
    cy.get('.alto-badge > .cursor-pointer > .bi').first().click();

    // Remove tag from the search and check that all the questions are displayed
    cy.wait(500);
    cy.get('input[type="checkbox"]:checked').should('have.length', 4);

    // Create the program and check that the questionCount is correct
    cy.get('.my-3 > .btn-primary').click();
    cy.wait(500);
    cy.get('[data-cy=questionCount]').should('contain', '3');

    // Go back to the questions and add an existing question to the program
    cy.get(':nth-child(5) > .col-1 > .ms-1 > .bi').click();
    cy.get('input[type="checkbox"]').eq(5).click();

    // Check that the questionCount is correct
    cy.get('.my-3 > .btn-primary').click();
    cy.wait(500);
    cy.get('[data-cy=questionCount]').should('contain', '4');

    // Delete the program and questions created
    cy.get(':nth-child(1) > .fs-6b').click();
    cy.get('[data-cy="deleteProgram"]').click();
    cy.get('.modal-body > .row > :nth-child(2) > .btn').click();
    cy.get('.questions > .table-panel > .table > tbody > :nth-child(1) > :nth-child(6) > .fs-5').click();
    cy.get('.row > :nth-child(2) > .btn').click();
    cy.get('.questions > .table-panel > .table > tbody > :nth-child(1) > :nth-child(6) > .fs-5').click();
    cy.get('.row > :nth-child(2) > .btn').click();
  });
});
