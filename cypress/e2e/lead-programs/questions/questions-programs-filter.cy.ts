describe('L/Programs Questions Tab', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/');
    cy.wait('@loadData');
  });

  const uuid = () => Cypress._.random(0, 1e6);
  const id = uuid();
  const newProg = `ABCDTEST${id}`;

  it('Creates a new program and a new question', () => {
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.get('[data-cy="leadMenuPrograms"]').click();
    cy.wait('@loadData');

    cy.get('[data-cy="createNewProgram"]').click();

    cy.get('[data-cy="programName"]').clear();
    cy.get('[data-cy="programName"]').type(newProg);

    cy.get('[data-cy="programTags"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();

    cy.get('[data-cy="programPriority"]').click();
    cy.get('.ng-dropdown-panel-items .ng-option').first().click();
    cy.get('[data-cy="programCreateNext"]').should('be.enabled');

    cy.intercept('POST', '/v1/programs').as('createProgram');
    cy.get('[data-cy="programCreateNext"]').click();
    cy.wait('@createProgram');

    cy.get('input[type="checkbox"]').first().click();

    cy.get('.btn-primary').last().click();
    cy.wait(500);
    cy.reload();
  });

  it('Filters questions table by the new program', () => {
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.get('[data-cy="leadMenuPrograms"]').click();
    cy.wait('@loadData');

    // Goes back to Questions tab
    cy.get('[data-cy="selectedTab"]').eq(1).click();

    cy.get('[data-cy="questionsProgramFilter"]').click();

    cy.get('.ng-dropdown-header > input').clear();

    cy.get('.ng-dropdown-header > input').type(`${newProg}{enter}`);

    cy.wait(500);

    cy.get('[data-cy="questionEditPen"]').first().click();

    cy.get('[data-cy="programsNames"]').should('contain.text', `${newProg}`);
  });

  it('Delete the new program and the new question', () => {
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.get('[data-cy="leadMenuPrograms"]').click();
    cy.wait('@loadData');

    cy.get('[data-cy="programSearch"]').type(`${newProg}{enter}`).wait(500);

    cy.get(`[data-cy="program${newProg}"]`).first().click().wait(500);

    cy.get('[data-cy="recapTab"]').click();
    cy.get('[data-cy="deleteProgram"]').click();

    cy.intercept('DELETE', '/v1/programs/**').as('deleteProgram');
    cy.get('[data-cy="deleteButton"]').click();
    cy.wait('@deleteProgram');
  });
});
