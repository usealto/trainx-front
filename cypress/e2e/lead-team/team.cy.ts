describe('Lead Team', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
    cy.get('[data-cy="leadMenuTeams"]').click();
  });

  it('Should load teams Page', () => {
    cy.get('[data-cy="leadTeamTitle"]').click();
    cy.get('[data-cy="leadTeamTitle"]').should('have.text', 'Équipes et membres');
  });

  describe('Teams section', () => {
    // TODO: Uncomment the following lines after fix the team deletion test.
    // describe('Team creating', () => {
    //   it('Should create a team', () => {
    //     cy.get('[data-cy="createTeam"]').click();
    //     cy.get('[data-cy="editLongnameInput"]').click().wait(3000).clear().type('NewTeam');
    //     cy.get('[data-cy="editShortnameInput"]').click().wait(3000).clear().type('NT');
    //     cy.get('[data-cy="btnSave"]').click();
    //     cy.wait(5000);
    //   });
    // });
    // TODO: Find a way to delete a team that is not on the 1st page.
    // describe('Team deleting', () => {
    //   it('Should delete the team', () => {
    //     // Delete the team
    //     cy.visit('/l/teams');
    //     cy.get('[data-cy="deleteNewTeam"]').should('be.visible').click();
    //     cy.get('.row > :nth-child(2) > .btn').should('be.visible').click();
    //     cy.wait(5000);
    //     // check that the deleted team no longer exists.
    //     cy.visit('/l/teams');
    //     cy.get('[data-cy="deleteNewTeam"]').should('not.exist');
    //   });
    // });
  });
});

describe('User Team', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username'), Cypress.env('auth_password'));
    cy.visit('/');
    cy.wait(1500);
  });

  it('not load lead teams from the menu', function () {
    cy.get('[data-cy="leadMenuTeams"]').should('be.hidden');
  });

  it('not load lead teams from url', function () {
    cy.visit('/l/teams');
    cy.url().should('not.include', '/l/teams');
    cy.url().should('include', '/u/home');
  });
});
