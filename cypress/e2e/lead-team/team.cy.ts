describe('Lead Team', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
    cy.get('[ng-reflect-router-link="l/teams"]').click();
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('Loads Team', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[data-cy="leadTeamTitle"]').click();
    cy.get('[data-cy="leadTeamTitle"]').should('have.text', 'Équipes');
    /* ==== End Cypress Studio ==== */
  });

  describe('Open Team Panel', () => {
    it('Opens edit team panel', () => {
      cy.get('[data-cy="editTeam"]').first().click();
    });
  });

  describe('Edits Team', () => {
    it('Edits team shortname and check "already existing" error', () => {
      cy.get('[data-cy="editTeam"]').first().click();

      cy.get('[data-cy="editShortnameInput"]').click().wait(1000).clear().type('CYP');
      cy.get('[data-cy="btnSave"').click();

      cy.get('[data-cy="closeEditTeamPanel"]').click();
      cy.get('[data-cy="toastError"]').contains('409');
    });
  });

  describe('Edits Team', () => {
    it('Edits team shortname and check it worked', () => {
      cy.get('[data-cy="editTeam"]').first().click();

      cy.get('[data-cy="editShortnameInput"]').click().wait(1000).clear().type('000');
      cy.get('[data-cy="btnSave"').click();

      cy.get('[data-cy="closeEditTeamPanel"]').click();

      cy.get('[data-cy="teamShortname"').first().should('have.text', '000');

      cy.get('[data-cy="editTeam"]').first().click();

      cy.get('[data-cy="editShortnameInput"]').click().wait(1000).clear().type('CYT');
      cy.get('[data-cy="btnSave"').click();

      cy.get('[data-cy="closeEditTeamPanel"]').click();

      cy.get('[data-cy="teamShortname"').first().should('have.text', 'CYT');
    });
  });

  describe('Edits Team', () => {
    it('Edits team longname and check "already existing" error', () => {
      cy.get('[data-cy="editTeam"]').first().click();

      cy.get('[data-cy="editLongnameInput"]').click().wait(1000).clear().type('Cypress');
      cy.get('[data-cy="btnSave"').click();

      cy.get('[data-cy="closeEditTeamPanel"]').click();
      cy.get('[data-cy="toastError"]').contains('409');
    });
  });

  describe('Edits Team', () => {
    // TODO clean up team name before testing it works
    it('Edits team longname and check it worked', () => {
      cy.get('[data-cy="editTeam"]').first().click();

      cy.get('[data-cy="editLongnameInput"]').click().wait(1000).clear().type('Cypress Edit');
      cy.get('[data-cy="btnSave"').click();

      cy.get('[data-cy="closeEditTeamPanel"]').click();
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-cy="teamLongname"').first().should('have.text', ' Cypress Edit ');
      /* ==== End Cypress Studio ==== */
    });
  });

  describe('Add Program', () => {
    it('Add a program to selected team and check it worked', () => {
      cy.get('[data-cy="editTeam"]');

      /* ==== Generated with Cypress Studio ==== */
      cy.get(':nth-child(4) > :nth-child(6) > [data-cy="editTeam"]').click();
      /* ==== End Cypress Studio ==== */

      cy.get('[data-cy="editProgramSelector"]').click();
      /* ==== Generated with Cypress Studio ==== */
      cy.get(
        '[data-cy="editProgramSelector"] > .ng-select-container > .ng-value-container > .ng-input > input',
      ).clear();
      cy.get(
        '[data-cy="editProgramSelector"] > .ng-select-container > .ng-value-container > .ng-input > input',
      )
        .wait(1000)
        .type('cypress{enter}');
      cy.get('[data-cy="btnSave"]').click();
      /* ==== End Cypress Studio ==== */
      cy.get(':nth-child(4) > :nth-child(6) > [data-cy="editTeam"]').click();
      /* ==== End Cypress Studio ==== */

      cy.get('[data-cy="editProgramSelector"]').click();
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-cy="editProgramSelector"] > .ng-select-container > .ng-value-container ')
        .wait(1000)
        .contains('Cypress');
    });
  });

  describe('Remove Program', () => {
    it('Remove a program from selected team  and check it worked', () => {
      cy.get('[data-cy="editTeam"]');

      /* ==== Generated with Cypress Studio ==== */
      cy.get(':nth-child(4) > :nth-child(6) > [data-cy="editTeam"]').click();
      /* ==== End Cypress Studio ==== */

      cy.get('[data-cy="editProgramSelector"]').click();
      /* ==== Generated with Cypress Studio ==== */
      cy.get(':nth-child(2) > .ng-value-icon').click();
      /* ==== End Cypress Studio ==== */

      cy.get('[data-cy="btnSave"]').click();

      cy.get(':nth-child(4) > :nth-child(6) > [data-cy="editTeam"]').click();

      cy.get('[data-cy="editProgramSelector"]').click();

      cy.get('[data-cy="editProgramSelector"] > .ng-select-container > .ng-value-container ')
        .wait(1000)
        .invoke('val')
        .should('eq', '');
    });
  });

  describe('Company Members Section', () => {
    it('Goes to company members section', () => {
      cy.get('[data-cy="companyMembersSection"]').should('have.text', 'Vos membres');
    });
  });

  describe('Edits User Team', () => {
    // TODO change user team before testing it works
    it('Changes a user team and check it worked', () => {
      cy.get('[data-cy="teamShortname"]')
        .first()
        .click()
        .then(($data) => {
          const textShortname = $data.text();
          const teamName = 'e2e';
          cy.get('.form-control').clear().type(teamName).wait(800);
          cy.get(':nth-child(2) > :nth-child(5) > [data-cy="editCompanyMember"]').click();

          cy.get('[data-cy="editMemberTeam"] .ng-input > input')
            .clear()
            .type(`${textShortname}{enter}`)
            .wait(500);
          cy.get('[data-cy="editMemberSave"]').click().wait(1000);

          cy.get('.form-control').clear().type(teamName).wait(800);
          cy.get(':nth-child(2) > :nth-child(5) > [data-cy="editCompanyMember"]').click();

          cy.get('[data-cy="editMemberTeam"] .ng-select-container > .ng-value-container > .ng-value')
            .wait(1000)
            .should('have.text', textShortname);
        });
    });
  });

  describe('Remove User Team', () => {
    it('Removes the user team and check save btn is disabled', () => {
      cy.get('[data-cy="editCompanyMember"]').first().click();

      cy.get('[data-cy="editMemberTeam"] .ng-select-container > .ng-clear-wrapper').click();
      cy.get('[data-cy="editMemberSave"]').should('have.attr', 'disabled');
    });
  });

  describe('Edits User Role', () => {
    it('Changes a user role and check it worked', () => {
      //utilisé pour prendre un role
      cy.get('[data-cy="editCompanyMember"]').first().click();

      cy.get('[data-cy="editMemberRole"]').then(($data) => {
        const teamName = 'e2e';
        const role = $data.text();
        cy.get('.form-control').clear().type(teamName).wait(800);
        cy.get(':nth-child(2) > :nth-child(5) > [data-cy="editCompanyMember"]').click();

        cy.get('[data-cy="editMemberRole"]').select(role);
        cy.get('[data-cy="editMemberSave"]').click();
        cy.get('[data-cy="editCompanyMember"]').first().click();
        cy.get('[data-cy="editMemberRole"]').find(':selected').contains(role);
      });
    });
  });
  // cy.get('[data-cy="teamShortname"]')
  // .first()
  // .click()
  // .then(($data) => {
  //   const text = $data.text();
  //   const teamShortname = 'e2e';
  //   cy.get('.form-control').clear().type(teamShortname).wait(800);
  //   cy.get(':nth-child(2) > :nth-child(5) > [data-cy="editCompanyMember"]').click();

  //   cy.get('[data-cy="editMemberTeam"] .ng-input > input').clear().type(`${text}{enter}`).wait(500);
  //   cy.get('[data-cy="editMemberSave"]').click().wait(1000);

  //   cy.get('.form-control').clear().type(teamShortname).wait(800);
  //   cy.get(':nth-child(2) > :nth-child(5) > [data-cy="editCompanyMember"]').click();

  //   cy.get('[data-cy="editMemberTeam"] .ng-select-container > .ng-value-container > .ng-value')
  //     .wait(1000)
  //     .should('have.text', text);
  // });

  describe('Filter by Team', () => {
    it('Filters members by team', () => {
      cy.get('[data-cy="teamShortname"]')
        .first()
        .click()
        .then(($data) => {
          const text = $data.text();
          cy.get('[data-cy="filterByTeam"]').click();
          cy.get('.ng-dropdown-header > input').clear().type(`${text}{enter}`).wait(500);
          cy.get('[data-cy="memberTeamShortname"]').first().should('contain', text);
        });
    });
  });

  describe('Filter by Score', () => {
    it('Filters members by score', () => {
      const score = '75';

      cy.get('[data-cy="filterByScore"]').click();
      cy.get('.ng-dropdown-header > input').clear();
      cy.get('.ng-dropdown-header > input').type(`${score}{enter}`);
      //here we compare the number of pixels to check the percentage, 1% being 2.9343px
      cy.get('[data-cy="scoreProgressBar"]').first().invoke('width').should('be.lessThan', 223.005);
    });
  });

  describe('Filter Search', () => {
    it('Filters members using search input', () => {
      /* ==== Generated with Cypress Studio ==== */
      cy.get('[data-cy="profileCard"] > .profile > .names-container > .name')
        .first()
        .click()
        .then(($data) => {
          const searchedText = $data.text().slice(0, 5);
          const text = $data.text();

          cy.get('[data-cy="filterBySearch"]').click();

          cy.get('.form-control').clear();
          cy.get('.form-control').type(`${searchedText}{enter}`);

          cy.get('[data-cy="profileCard"] > .profile > .names-container > .name')
            .first()
            .should('have.text', text);
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
