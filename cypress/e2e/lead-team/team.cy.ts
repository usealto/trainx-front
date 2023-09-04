describe('Lead Team', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
    cy.get('[ng-reflect-router-link="l/teams"]').click();
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('Should load teams Page', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[data-cy="leadTeamTitle"]').click();
    cy.get('[data-cy="leadTeamTitle"]').should('have.text', 'Équipes et membres');
    /* ==== End Cypress Studio ==== */
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

  describe('Members Section', () => {
    it('Should redirect to members section', () => {
      cy.get('[data-cy="companyMembersSection"]').should('have.text', ' Vos membres ');
    });

    it('Should change a user team and check it worked', () => {
      // Check that the initial team of the user was " Manager - Man "
      cy.contains('table tbody tr', 'e2e testing2')
        .find('[data-cy="memberTeamShortname"]')
        .should('have.text', ' Manager - MAN ');

      // Change the user team to " Cypress - CYP " team
      cy.contains('table tbody tr', 'e2e testing2')
        .find('[data-cy="editCompanyMember"]')
        .click()
        .then(() => {
          cy.get('[data-cy="editMemberTeam"] .ng-input > input')
            .clear()
            .type(`${'cypress'}{enter}`)
            .wait(500);
          cy.get('[data-cy="editMemberSave"]').click().wait(1000);
        });

      // Check it worked
      cy.contains('table tbody tr', 'e2e testing2')
        .find('[data-cy="memberTeamShortname"]')
        .should('have.text', ' Cypress - CYP ');

      // Reset to original team value
      cy.contains('table tbody tr', 'e2e testing2')
        .find('[data-cy="editCompanyMember"]')
        .click()
        .then(() => {
          cy.get('[data-cy="editMemberTeam"] .ng-input > input')
            .clear()
            .type(`${'manager'}{enter}`)
            .wait(500);
          cy.get('[data-cy="editMemberSave"]').click().wait(1000);
        });

      cy.contains('table tbody tr', 'e2e testing2')
        .find('[data-cy="memberTeamShortname"]')
        .should('have.text', ' Manager - MAN ');
    });

    /**
     * TODO: Check if this is a bug in v3.2, but the team of the selected user is no longer displayed in the input.
     * If it's not a bug, delete this test.
     **/
    // it('Should remove the user team and check save btn is disabled', () => {
    //   cy.get('[data-cy="editCompanyMember"]').first().click();

    //   cy.get('[data-cy="editMemberTeam"] .ng-select-container > .ng-clear-wrapper').click();
    //   cy.get('[data-cy="editMemberSave"]').should('have.attr', 'disabled');
    // });

    it('Should check user roles options', () => {
      cy.contains('table tbody tr', 'e2e testing2')
        .find('[data-cy="editCompanyMember"]')
        .click()
        .then(() => {
          cy.get('[data-cy="editMemberRole"]').select(0).should('have.value', 'company-user');
          cy.get('[data-cy="editMemberRole"]').select(1).should('have.value', 'company-admin');
        });
    });
  });
});

describe('User Team', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username'), Cypress.env('auth_password'));
    cy.visit('/');
    cy.wait(1500);
  });

  it('not load lead teams from the menu', function () {
    cy.get('[ng-reflect-router-link="l/teams"]').should('be.hidden');
  });

  it('not load lead teams from url', function () {
    cy.visit('/l/teams');
    cy.url().should('not.include', '/l/teams');
    cy.url().should('include', '/u/home');
  });
});
