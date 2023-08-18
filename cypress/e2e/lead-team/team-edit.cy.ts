describe('Add/Remove Program', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
    cy.get('[ng-reflect-router-link="l/teams"]').click();
  });

  it('Add a program to selected team and then remove it', () => {
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
