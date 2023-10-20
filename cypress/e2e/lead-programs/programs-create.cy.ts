describe('Lead Programs', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');
  });
  it('Creates and delete a program', function () {
    const uuid = () => Cypress._.random(0, 1e6);
    const id = uuid();
    const newProg = `ABCDTEST${id}`;
    cy.get('[data-cy="leadMenuPrograms"]').click();
    cy.wait(500);
    cy.get('[data-cy="createNewProgram"]').click();

    // Create a new program
    cy.get('[data-cy="programName"]').clear();
    cy.get('[data-cy="programName"]').type(newProg);

    cy.get('[data-cy="programTags"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();

    cy.get('[data-cy="programPriority"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();

    cy.wait(100);

    cy.intercept('POST', '').as('newProgram');
    cy.get('[data-cy="programCreateNext"]').click();
    cy.wait('@newProgram').wait(100);

    cy.get('.btn-primary').eq(1).click();

    // Delete the program

    cy.get('[data-cy="leadMenuPrograms"]').click();

    cy.get('[data-cy="programSearch"]').clear();

    cy.get('[data-cy="programSearch"]').type(newProg);
    cy.get(`[data-cy="program${newProg}"]`).click();

    cy.wait(500);

    cy.get('[data-cy="recapTab"]').click();

    cy.get('[data-cy="deleteProgram"]').click();

    cy.wait(500);

    cy.get('[data-cy="deleteButton"]').click();

    // Check if the program is deleted
    cy.wait(500);
    cy.get('[data-cy="leadMenuPrograms"]').click();

    cy.get('[data-cy="programSearch"]').clear();
    cy.get('[data-cy="programSearch"]').type(newProg);

    cy.get(`[data-cy="program${newProg}"]`).should('not.exist');
  });
});
