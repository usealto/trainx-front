describe('Lead Programs', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');
  });
  it('Creates and delete a program', function () {
    const newProg = 'ABCDTEST';
    cy.get('[ng-reflect-router-link="l/programs"]').click();
    cy.wait(500);
    cy.get('[data-cy="createNewProgram"]').click();

    // Create a new program
    cy.get('[data-cy="programName"]').clear();
    cy.get('[data-cy="programName"]').type(newProg);

    cy.get('[data-cy="programTags"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();

    cy.get('[data-cy="programPriority"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();

    cy.get('[data-cy="programCreateNext"]').click();
    cy.get('[data-cy="programCreateSave"]').click();

    // Delete the program

    cy.get('[ng-reflect-router-link="l/programs"]').click();

    cy.get('.d-inline-block > .search-group > .form-control').clear();
    cy.get('.d-inline-block > .search-group > .form-control').type(newProg);
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
});
