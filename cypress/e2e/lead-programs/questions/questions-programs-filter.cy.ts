describe('L/Programs Questions Tab', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');

    cy.get('[ng-reflect-router-link="l/programs"]').click();
  });

  const newProg = 'ABCDTEST';
  const newQuestion = 'testQuestion';
  const goodAnswer = 'goodAnswer';
  const badAnswer = 'badAnswer';

  it('Creates a new program and a new question', () => {
    cy.get('[data-cy="createNewProgram"]').click();

    cy.get('[data-cy="programName"]').clear();
    cy.get('[data-cy="programName"]').type(newProg);

    cy.get('[data-cy="programTags"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();

    cy.get('[data-cy="programPriority"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();

    cy.get('[data-cy="programCreateNext"]').click();

    // Create a new question
    cy.get('[data-cy="createNewQuestion"]').click();
    cy.get('[data-cy="questionCreateTitle"]').type(newQuestion);
    cy.get('[data-cy="goodAnswerInput"]').type(goodAnswer);
    cy.get('[data-cy="badAnswerInput"]').type(badAnswer);
    cy.get('[data-cy="tagSelectDropdown"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();
    cy.get('.button-container > .btn-primary').click();
    cy.wait(500);

    cy.get('.btn-close').click();
    cy.get('.btn-primary').eq(1).click();
    cy.wait(500);
    cy.reload();
  });

  it('Filters questions table by the new program', () => {
    // Goes back to Questions tab
    cy.get('[data-cy="selectedTab"]').eq(1).click();

    cy.get('[data-cy="questionsProgramFilter"]').click();

    cy.get('.ng-dropdown-header > input').clear();
    cy.get('.ng-dropdown-header > input').type(`${newProg}{enter}`).wait(500);

    cy.get('[data-cy="questionEditPen"]').first().click();

    cy.get('[data-cy="programsNames"]').should('contain.text', `${newProg}`);
  });

  it('Delete the new program and the new question', () => {
    cy.get('[data-cy="programSearch"]').type(`${newProg}{enter}`).wait(500);

    cy.get(`[data-cy="program${newProg}"]`).first().click().wait(500);

    cy.get('[data-cy="recapTab"]').click();
    cy.get('[data-cy="deleteProgram"]').click();
    cy.get('[data-cy="deleteButton"]').click();

    cy.get('[data-cy="selectedTab"]').eq(1).click();
    cy.get('[data-cy="deleteQuestionTrash"]').first().click();
    cy.get('[data-cy="buttonDeleteQuestion"] ').click();
  });
});
