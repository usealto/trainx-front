describe('Lead Team', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/');
    cy.get('[data-cy="leadMenuTeams"]').click();
    cy.wait('@loadData');
  });

  it('Should load teams Page', () => {
    cy.get('[data-cy="leadTeamTitle"]').click();
    cy.get('[data-cy="leadTeamTitle"]').should('have.text', 'Équipes et membres');
  });

  describe('Teams section', () => {
    // TODO: Uncomment the following lines after fix the team deletion test.
    //   const uuid = () => Cypress._.random(0, 1e6);
    //   const id = uuid();
    //   const testname = `testname${id}`;
    //   describe('Team creating', () => {
    //     it('Should create a team', () => {
    //       cy.get('[data-cy="createTeam"]').click();
    //       cy.get('[data-cy="editLongnameInput"]').click().wait(3000).clear().type(`${testname}`);
    //       cy.get('[data-cy="btnSave"]').click();
    //       cy.wait(5000);
    //     });
    //   });
    //   // TODO: Find a way to delete a team that is not on the 1st page.
    //   describe('Team deleting', () => {
    //     it('Should delete the team', () => {
    //       // Delete the team
    //       cy.visit('/l/teams');
    //       cy.get(`[data-cy="delete${testname}"]`).should('be.visible').click();
    //       cy.get('.row > :nth-child(2) > .btn').should('be.visible').click();
    //       cy.wait(5000);
    //       // check that the deleted team no longer exists.
    //       cy.visit('/l/teams');
    //       cy.get('[data-cy="deleteNewTeam"]').should('not.exist');
    //     });
    //   });
  });
});

describe('User Team', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username'), Cypress.env('auth_password'));
    cy.visit('/');
  });

  it('not load lead teams from the menu', () => {
    cy.get('[data-cy="leadMenuTeams"]').should('be.hidden');
  });

  it('not load lead teams from url', () => {
    cy.visit('/l/teams').then(() => {
      cy.url().should('not.include', '/l/teams');
      cy.url().should('include', '/u/home');
    });
  });
});
