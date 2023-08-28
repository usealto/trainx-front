describe('Add/Remove Program', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
    cy.get('[ng-reflect-router-link="l/teams"]').click();
  });

  it('Should open edit team panel', () => {
    cy.get('[data-cy="editTeam"]').first().click();
  });

  it('Should close edit team panel', () => {
    cy.get('[data-cy="editTeam"]').first().click();
    cy.get('[data-cy="closeEditTeamPanel"]').first().click();
  });

  describe('Shortname/Longname editing', () => {
    it('Should edit team shortname and check "already existing" error', () => {
      cy.get('table tr').eq(2).find('[data-cy="editTeam"]').click();

      cy.get('[data-cy="editShortnameInput"]')
        .click()
        .invoke('val')
        .then(($data) => {
          const existedTeamShortname = $data ? $data.toString() : '';
          const errorToast = '409';

          cy.get('[data-cy="closeEditTeamPanel"]').first().click();

          cy.get('[data-cy="editTeam"]').first().click();
          cy.get('[data-cy="editShortnameInput"]').click().wait(100).clear().type(existedTeamShortname);
          cy.get('[data-cy="btnSave"').click();

          cy.get('[data-cy="closeEditTeamPanel"]').click();
          cy.get('[data-cy="toastError"]').contains(errorToast);
        });
    });

    it('Should edit team shortname and check it worked', () => {
      let oldShortname: string;

      cy.get('[data-cy="editTeam"]')
        .first()
        .click()
        .wait(1000)
        .then(() => {
          cy.get('[data-cy="editShortnameInput"]').then(($input) => {
            oldShortname = $input.val() as string;

            const newShortName = '000';

            // Edit team shortname
            cy.get('[data-cy="editShortnameInput"]').click().wait(100).clear().type(newShortName);
            cy.get('[data-cy="btnSave"]').click();
            cy.get('[data-cy="closeEditTeamPanel"]').click().wait(100);

            // Check that it's work
            cy.get('[data-cy="editTeam"]').first().click();
            cy.get('[data-cy="editShortnameInput"]').should('have.value', newShortName);

            // Reset shortname update
            cy.get('[data-cy="editShortnameInput"]').click().wait(100).clear().type(oldShortname);
            cy.get('[data-cy="btnSave"]').click();
            cy.get('[data-cy="closeEditTeamPanel"]').click().wait(100);

            cy.get('[data-cy="editTeam"]').first().click();
            cy.get('[data-cy="editShortnameInput"]').should('have.value', oldShortname);
          });
        });
    });

    it('Should edit team longname and check "already existing" error', () => {
      cy.get(':nth-child(2) > [data-cy="teamLongname"]')
        .click()
        .then(($data) => {
          const teamLongname = $data.text().trim();
          const errorToast = '409';

          cy.get('[data-cy="editTeam"]').first().click();

          cy.get('[data-cy="editLongnameInput"]').click().wait(100).clear().type(teamLongname);
          cy.get('[data-cy="btnSave"').click();

          cy.get('[data-cy="closeEditTeamPanel"]').click();
          cy.get('[data-cy="toastError"]').contains(errorToast);
        });
    });

    it('Should edit team longname and check it worked', () => {
      let oldLongname: string;

      cy.get('[data-cy="editTeam"]')
        .first()
        .click()
        .wait(1000)
        .then(() => {
          cy.get('[data-cy="editLongnameInput"]').then(($input) => {
            oldLongname = $input.val() as string;

            const newLongName = 'Updated Longname';

            // Update team longname
            cy.get('[data-cy="editLongnameInput"]').click().wait(100).clear().type(newLongName);
            cy.get('[data-cy="btnSave"').click();
            cy.get('[data-cy="closeEditTeamPanel"]').click().wait(100);

            // Check that it's work
            cy.get('[data-cy="teamLongname"').first().should('contain.text', newLongName);

            // Reset team longname
            cy.get('[data-cy="editTeam"]').first().click();
            cy.get('[data-cy="editLongnameInput"]').click().wait(100).clear().type(oldLongname);
            cy.get('[data-cy="btnSave"').click();
            cy.get('[data-cy="closeEditTeamPanel"]').click().wait(100);

            // Check that it's work
            cy.get('[data-cy="teamLongname"').first().should('contain.text', oldLongname);
          });
        });
    });
  });

  describe('Programs assignation', () => {
    /**
     * TODO: Once the deletion is fixed, enhance this test so that it follows this behavior:
     * Create a team ~> Assign a program to this team ~> Delete the assigned program ~> Delete the created team.
     **/
    // TODO: Ce test est correct. Il y'a un truc chelou qui se passe avec l'assignation des programmes aux équipes sur la v3.2
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

          cy.get('.ng-option-label').contains(newProgramToAdd).click().wait(100);
          cy.get('.offcanvas').click();

          cy.get('[data-cy="btnSave"]').click();
          cy.get('.btn-close').click().wait(1000);

          cy.get('[data-cy="editTeam"]').first().click();
          cy.get('[data-cy="editProgramSelector"]').click();
          cy.get('[data-cy="editProgramSelector"] > .ng-select-container > .ng-value-container ')
            .wait(1000)
            .should('contain', newProgramToAdd);

          cy.get('[data-cy="editProgramSelector"] > .ng-select-container > .ng-value-container ')
            .contains(newProgramToAdd)
            .parent()
            .children('.ng-value-icon')
            .click();

          cy.get('[data-cy="btnSave"]').click();
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
