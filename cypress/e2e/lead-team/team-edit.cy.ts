describe('Team edition', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/');
    cy.get('[data-cy="leadMenuTeams"]').click();
    cy.wait('@loadData');
  });

  it('Should open edit team panel', () => {
    cy.get('[data-cy="editTeam"]').first().click();
  });

  it('Should close edit team panel', () => {
    cy.get('[data-cy="editTeam"]').first().click();
    cy.get('[data-cy="closeEditTeamPanel"]').first().click();
  });

  describe('Longname edition', () => {
    it('Should edit team longname and check "already existing" error', () => {
      cy.get(':nth-child(2) > [data-cy="teamLongname"]')
        .click()
        .then(($data) => {
          const teamLongname = $data.text().trim();

          cy.get('[data-cy="editTeam"]').first().click();

          cy.get('[data-cy="editLongnameInput"]').click().wait(500).clear().type(teamLongname);
          cy.get('[data-cy="btnSave"').should('be.disabled');

          cy.get('[data-cy="closeEditTeamPanel"]').click();
        });
    });

    it('Should edit team longname and check it worked', () => {
      let oldLongname: string;
      cy.intercept('GET', '/v1/teams/*').as('team');

      cy.get('[data-cy="editTeam"]').first().click();

      cy.wait('@team');

      cy.get('[data-cy="editLongnameInput"]').then(($input) => {
        oldLongname = $input.val() as string;

        const newLongName = 'Updated Longname' + Math.floor(Math.random() * 1000);

        cy.intercept('GET', '/v1/stats/teams*').as('statsTeams');
        // Update team longname
        cy.get('[data-cy="editLongnameInput"]').click().wait(1000).clear().type(newLongName);
        cy.get('[data-cy="btnSave"').click();
        cy.get('[data-cy="closeEditTeamPanel"]').click().wait('@statsTeams');

        // Check that it's work
        cy.get('[data-cy="teamLongname"').first().should('contain.text', newLongName);

        // Reset team longname
        cy.get('[data-cy="editTeam"]').first().click();
        cy.wait('@team');
        cy.get('[data-cy="editLongnameInput"]').click().wait(1000).clear().type(oldLongname);
        cy.get('[data-cy="btnSave"').click();
        cy.get('[data-cy="closeEditTeamPanel"]').click().wait('@statsTeams');

        // Check that it's work
        cy.get('[data-cy="teamLongname"').first().should('contain.text', oldLongname);
      });
    });
  });

  describe('Programs assignation', () => {
    it('Should add a program to selected team and then remove it', () => {
      cy.get('[data-cy="editTeam"]').first().click();
      cy.get('[data-cy="editProgramSelector"] > .ng-select-container > .ng-arrow-wrapper').click().wait(500);
      cy.get('.ng-option')
        .not('.ng-option-selected')
        .first()
        .then(($data) => {
          const newProgramToAdd = $data.text();
          cy.get(
            '[data-cy="editProgramSelector"] > .ng-select-container > .ng-value-container > .ng-input > input',
          ).should('not.contain', newProgramToAdd);
          cy.get(
            '[data-cy="editProgramSelector"] > .ng-select-container > .ng-value-container > .ng-input > input',
          ).type(`${newProgramToAdd}`);
          cy.get('.ng-option').contains(newProgramToAdd).click().wait(100);
          cy.get('.offcanvas').click();
          cy.get('[data-cy="btnSave"]').click();
          cy.get('.btn-close').click().wait(1000);
          cy.get('[data-cy="editTeam"]').first().click();
          cy.get('[data-cy="editProgramSelector"]').click();
          cy.get('[data-cy="editProgramSelector"] > .ng-select-container > .ng-value-container ')
            .wait(1000)
            .should('contain', newProgramToAdd);

          // selects the previously added program and check for its siblings containing deletion  icon
          cy.intercept('PATCH', '').as('editTeam');
          cy.get('[data-cy="editProgramSelector"] > .ng-select-container > .ng-value-container ')
            .contains(newProgramToAdd)
            .siblings()
            .children('[data-cy="deleteIcon"]')
            .click();
          cy.get('[data-cy="btnSave"]').click();
          cy.wait('@editTeam');
          cy.get('.btn-close').click();
          cy.get('[data-cy="editTeam"]').first().click().wait(1000);
          cy.get('[data-cy="editProgramSelector"]').click();
          cy.get('[data-cy="editProgramSelector"] > .ng-select-container > .ng-value-container ')
            .wait(1000)
            .should('not.contain', newProgramToAdd);
        });
    });
  });
});
