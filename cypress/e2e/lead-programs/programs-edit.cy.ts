// TODO Uncomment test when program creation is fixed
describe('Lead Programs', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');
  });
  it('create and edit a program while testing all cases of question creation', function () {
    const newProg = 'ABCDTEST';
    const newQuestion = 'testQuestion';
    const goodAnswer = 'goodAnswer';
    const badAnswer = 'badAnswer';
    const newQuestion2 = 'testQuestion2';
    const goodAnswer2 = 'goodAnswer2';
    const badAnswer2 = 'badAnswer2';

    cy.get('[data-cy="leadMenuPrograms"]').click();
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

    cy.intercept('POST', '').as('newProgram');
    cy.get('[data-cy="programCreateNext"]').click();
    cy.wait('@newProgram').wait(100);

    // Create a new question

    cy.get('[data-cy="createNewQuestion"]').click();
    cy.get('[data-cy="questionCreateTitle"]').children('textarea').clear();
    cy.get('[data-cy="questionCreateTitle"]').children('textarea').type(newQuestion);

    cy.get('[data-cy="goodAnswerInput"]').children('textarea').clear();
    cy.get('[data-cy="goodAnswerInput"]').children('textarea').type(goodAnswer);

    cy.get('[data-cy="badAnswerInput"]').children('textarea').clear();
    cy.get('[data-cy="badAnswerInput"]').children('textarea').type(badAnswer);

    cy.get('[data-cy="tagSelectDropdown"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();

    cy.intercept('POST', '').as('newQuestion');
    cy.get('.button-container > .btn-primary').click();
    cy.wait('@newQuestion').wait(100);
    cy.get('a[aria-label="Close"]').first().click();

    // Create a new question with a different tag
    cy.get('[data-cy="questionCreateTitle"]').children('textarea').clear();
    cy.get('[data-cy="questionCreateTitle"]').children('textarea').type(newQuestion2);

    cy.get('[data-cy="goodAnswerInput"]').children('textarea').clear();
    cy.get('[data-cy="goodAnswerInput"]').children('textarea').type(goodAnswer2);

    cy.get('[data-cy="badAnswerInput"]').children('textarea').clear();
    cy.get('[data-cy="badAnswerInput"]').children('textarea').type(badAnswer2);

    cy.get('[data-cy="tagSelectDropdown"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').eq(1).click();

    cy.intercept('POST', '').as('newQuestion2');
    cy.get('.button-container > .btn-primary').click();
    cy.wait('@newQuestion2').wait(100);
    cy.get('a[aria-label="Close"]').first().click();

    // Closes question form

    cy.get('.btn-close').click();

    // Create the program and check that the questionCount is correct
    cy.get('.btn-primary').eq(1).click();
    cy.wait(500);
    cy.get('[data-cy=questionCount]').should('contain', '2');

    // Go back to the questions and add an existing question to the program
    cy.get('[data-cy="questionsTab"]').click();
    cy.get('input[type="checkbox"]').last().click();

    // Check that the questionCount is correct
    cy.get('.btn-primary').eq(1).click();
    cy.wait(500);
    cy.get('[data-cy=questionCount]').should('contain', '3');

    // Delete the program and questions created
    cy.get('[data-cy="recapTab"]').click();
    cy.get('[data-cy="deleteProgram"]').click();
    cy.intercept('DELETE', '').as('deleteProgram');
    cy.get('[data-cy="deleteButton"]').click();
    cy.wait('@deleteProgram').wait(100);

    cy.get('[data-cy="selectedTab"]').eq(1).click();

    cy.get('[data-cy="deleteQuestionTrash"]').first().click();
    cy.intercept('DELETE', '').as('deleteQuestion1');
    cy.get('[data-cy="buttonDeleteQuestion"] ').click();
    cy.wait('@deleteQuestion1').wait(100);

    cy.get('[data-cy="deleteQuestionTrash"]').first().click();
    cy.intercept('DELETE', '').as('deleteQuestion2');
    cy.get('[data-cy="buttonDeleteQuestion"] ').click();
    cy.wait('@deleteQuestion2').wait(100);
  });
});
