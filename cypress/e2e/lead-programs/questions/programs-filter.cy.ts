describe('L/Programs Questions Tab', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');

    cy.get('[ng-reflect-router-link="l/programs"]').click();
  });

  it('filter questions by program', () => {
    const newProg = 'ABCDTEST';
    cy.get('[data-cy="createNewProgram"]').click();

    // Create a new program
    cy.get('[data-cy="programName"]').clear();
    cy.get('[data-cy="programName"]').type(newProg);

    cy.get('[data-cy="programTags"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();

    cy.get('[data-cy="programPriority"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();

    cy.get('[data-cy="programCreateNext"]').click();

    cy.get('input[type="checkbox"]').first().click();

    cy.get('.btn-primary').eq(1).click();

    // Goes back to Questions tab

    cy.get('[ng-reflect-router-link="l/programs"]').click();

    cy.get('[data-cy="selectedTab"]').eq(1).click();

    // Goes back to Questions tab

    cy.get('[data-cy="questionsProgramFilter"]').click();

    cy.get('.ng-dropdown-header > input').clear();
    cy.get('.ng-dropdown-header > input').type(`${newProg}{enter}`).wait(500);

    cy.get('[data-cy="questionPrograms"] > alto-colored-pill-list > :nth-child(1)').should(
      'have.text',
      `${newProg}`,
    );
  });
});
