describe('L/Teams Members Section', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
    cy.get('[data-cy="leadMenuTeams"]').click();
  });

  it('Filters members by team', () => {
    const team = 'MAN';

    cy.get('[data-cy="filterByTeam"]').click();

    cy.get('.ng-dropdown-header > input').clear();
    cy.get('.ng-dropdown-header > input')
      .type(`${team}`)
      .then(() => {
        cy.get('.ng-dropdown-panel > .ng-dropdown-panel-items > div > .ng-option').first().click();
      });

    cy.wait(200);

    cy.get('[data-cy="memberTeamName"]').first().should('have.text', ' Manager ');
  });
});
