describe('Lead Programs', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');
  });
  it('create and edit a program while testing all cases of question creation', function () {
    const newProg = 'ABCDTEST';
    const newQuestion = 'testqst';
    const goodAnswer = 'goodAnswer';
    const badAnswer = 'badAnswer';
    cy.get('[ng-reflect-router-link="l/programs"]').click();
    cy.wait(500);
    cy.get('[data-cy="createNewProgram"]').click();
    cy.wait(500);

    // Create a new program
    cy.get('[data-cy="programName"]').clear();
    cy.get('[data-cy="programName"]').type(newProg);

    cy.get('[data-cy="programTags"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();

    cy.get('[data-cy="programPriority"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();

    cy.get('[data-cy="programCreateNext"]').click();

    cy.get('input[type="checkbox"]').first().click();
    // Create a new question
    cy.get('[data-cy="createNewQuestion"]').click();
    cy.get('[data-cy="questionCreateTitle"]').type(newQuestion);
    cy.get(':nth-child(4) > .flex-grow-1 > .form-control').type(goodAnswer);
    cy.get(':nth-child(8) > .flex-grow-1 > .form-control').type(badAnswer);
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
