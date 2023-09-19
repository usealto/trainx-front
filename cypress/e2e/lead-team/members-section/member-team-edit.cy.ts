describe('Lead Team', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
    cy.get('[href="/l/teams"]').click();
  });

  it('Should load teams Page', () => {
    cy.get('[data-cy="leadTeamTitle"]').click();
    cy.get('[data-cy="leadTeamTitle"]').should('have.text', 'Équipes et membres');
  });

  describe('Members Section', () => {
    it('Should redirect to members section', () => {
      cy.get('[data-cy="companyMembersSection"]').should('have.text', ' Vos membres ');
    });

    it('Should change a user team and check it worked', () => {
      const searchedText = 'e2e';
      let previousTeamName = '';
      let newAssignedTeam = '';
      // Search for E2E User testing member because its is the only that cypress can modifies

      cy.get('[data-cy="filterBySearch"]').click();

      cy.get('.form-control').clear();
      cy.get('.form-control').type(`${searchedText}`);

      // Check the initial team of the E2E User and collects its name

      cy.contains('[data-cy="companyMembersTable"]', 'e2e testing2')
        .find('[data-cy="memberTeamName"]')
        .first()
        .then(($data) => {
          previousTeamName = $data.text();

          cy.contains('[data-cy="companyMembersTable"]', 'e2e testing2')
            .find('[data-cy="editCompanyMember"]')
            .click();

          // Get the last team among the dropdown options and assign it to E2E User

          cy.get('[data-cy="editMemberTeam"]').click();
          cy.get('.ng-option')
            .last()
            .then(($data) => {
              newAssignedTeam = $data.text();
              cy.get('.ng-option').last().click();

              cy.get('[data-cy="editMemberSave"]').click().wait(1000);

              // Check it worked

              cy.get('[data-cy="filterBySearch"]').click();

              cy.get('.form-control').clear();
              cy.get('.form-control').type(`${searchedText}`);

              cy.contains('[data-cy="companyMembersTable"]', 'e2e testing2')
                .find('[data-cy="memberTeamName"]')
                .should('have.text', newAssignedTeam);

              // Reset to original team value

              cy.get('[data-cy="filterBySearch"]').click();

              cy.get('.form-control').clear();
              cy.get('.form-control').type(`${searchedText}`);

              cy.contains('[data-cy="companyMembersTable"]', 'e2e testing2')
                .find('[data-cy="editCompanyMember"]')
                .click();

              cy.get('[data-cy="editMemberTeam"]').click();
              cy.contains('.ng-option', previousTeamName).click();
              cy.get('[data-cy="editMemberSave"]').click().wait(1000);

              // Check it worked

              cy.get('[data-cy="filterBySearch"]').click();

              cy.get('.form-control').clear();
              cy.get('.form-control').type(`${searchedText}`);

              cy.contains('[data-cy="companyMembersTable"]', 'e2e testing2')
                .find('[data-cy="memberTeamName"]')
                .should('have.text', previousTeamName);
            });
        });
    });

    it('Should remove the user team and check save btn is disabled', () => {
      cy.get('[data-cy="editCompanyMember"]').first().click();

      cy.get('[data-cy="editMemberTeam"] .ng-select-container > .ng-clear-wrapper').click();
      cy.get('[data-cy="editMemberSave"]').should('have.attr', 'disabled');
    });

    it('Should check user roles options', () => {
      cy.get('[data-cy="companyMembersTable"]')
        .find('[data-cy="editCompanyMember"]')
        .first()
        .click()
        .then(() => {
          cy.get('[data-cy="editMemberRole"]').select(0).should('have.value', 'company-user');
          cy.get('[data-cy="editMemberRole"]').select(1).should('have.value', 'company-admin');
        });
    });
  });
});
