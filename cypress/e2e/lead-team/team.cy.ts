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

  describe('Edits Team Shortname', () => {
    it('Edits team shortname and check "already existing" error', () => {
      cy.get(':nth-child(2) > [data-cy="teamShortname"] > .alto-badge')
        .click()
        .then(($data) => {
          const teamShortname = $data.text().trim();
          const errorToast = '409';
          cy.get('[data-cy="editTeam"]').first().click();

          cy.get('[data-cy="editShortnameInput"]').click().wait(1000).clear().type(teamShortname);
          cy.get('[data-cy="btnSave"').click();

          cy.get('[data-cy="closeEditTeamPanel"]').click();
          cy.get('[data-cy="toastError"]').contains(errorToast);
        });
    });
  });

  describe('Edits Team Shortname', () => {
    it('Edits team shortname and check it worked', () => {
      const teamShortname0 = '000';
      const teamShortname1 = 'CYT';
      cy.get('[data-cy="editTeam"]').first().click();

      cy.get('[data-cy="editShortnameInput"]').click().wait(1000).clear().type(teamShortname0);
      cy.get('[data-cy="btnSave"').click();

      cy.get('[data-cy="closeEditTeamPanel"]').click();

      cy.get('[data-cy="teamShortname"').first().should('have.text', teamShortname0);

      cy.get('[data-cy="editTeam"]').first().click();

      cy.get('[data-cy="editShortnameInput"]').click().wait(1000).clear().type(teamShortname1);
      cy.get('[data-cy="btnSave"').click();

      cy.get('[data-cy="closeEditTeamPanel"]').click();

      cy.get('[data-cy="teamShortname"').first().should('have.text', teamShortname1);
    });
  });

  describe('Edits Team Longname', () => {
    it('Edits team longname and check "already existing" error', () => {
      cy.get(':nth-child(2) > [data-cy="teamLongname"]')
        .click()
        .then(($data) => {
          const teamLongname = $data.text().trim();
          const errorToast = '409';

          cy.get('[data-cy="editTeam"]').first().click();

          cy.get('[data-cy="editLongnameInput"]').click().wait(1000).clear().type(teamLongname);
          cy.get('[data-cy="btnSave"').click();

          cy.get('[data-cy="closeEditTeamPanel"]').click();
          cy.get('[data-cy="toastError"]').contains(errorToast);
        });
    });
  });

  describe('Edits Team Longname', () => {
    it('Edits team longname and check it worked', () => {
      const teamLongname0 = 'Cypress Edit1';
      const teamLongname1 = 'Cypress Edit2';

      cy.get('[data-cy="editTeam"]').first().click();
      cy.get('[data-cy="editLongnameInput"]').click().wait(1000).clear().type(teamLongname0);
      cy.get('[data-cy="btnSave"').click();
      cy.get('[data-cy="closeEditTeamPanel"]').click();

      cy.get('[data-cy="teamLongname"').first().should('contain.text', teamLongname0);

      cy.get('[data-cy="editTeam"]').first().click();
      cy.get('[data-cy="editLongnameInput"]').click().wait(1000).clear().type(teamLongname1);
      cy.get('[data-cy="btnSave"').click();
      cy.get('[data-cy="closeEditTeamPanel"]').click();

      cy.get('[data-cy="teamLongname"').first().should('contain.text', teamLongname1);
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

  //TODO make this test work
  describe('Edits User Role', () => {
    beforeEach(() => {
      const teamName = 'e2e';

      cy.get('.form-control').clear();
      cy.get('.form-control').type(`${teamName}{enter}`).wait(1000);
      cy.get(':nth-child(2) > :nth-child(5) > [data-cy="editCompanyMember"]').click();
    });

    it('Checks first option is "company-user"', () => {
      cy.get('[data-cy="editMemberRole"]').select(0).should('have.value', 'company-user');
    });

    it('Checks second option is "company-admin"', () => {
      cy.get('[data-cy="editMemberRole"]').select(1).should('have.value', 'company-admin');
    });
  });

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

  //TODO compare the width value directly
  describe('Filter by Score', () => {
    it('Filters members by score', () => {
      const score = '75';

      cy.get('[data-cy="filterByScore"]').click();
      cy.get('.ng-dropdown-header > input').clear();
      cy.get('.ng-dropdown-header > input').type(`${score}{enter}`);
      cy.get('[data-cy="scoreProgressBar"]').first().invoke('width').should('be.lessThan', 223.005);
    });
  });

  describe('Filter Search', () => {
    it('Filters members using search input', () => {
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

  it('Create and delete a team', () => {
    // Create a new Team
    cy.get('[data-cy="createTeam"]').click();
    cy.get('[data-cy="editLongnameInput"]').click().wait(3000).clear().type('ABCDETEAM');
    cy.get('[data-cy="editShortnameInput"]').click().wait(3000).clear().type('ABCD');
    cy.get('[data-cy="btnSave"]').click();

    cy.wait(5000);

    // Delete the newly created team
    cy.visit('/l/teams');
    cy.get('[data-cy="deleteTeamABCD"]').should('be.visible').click();
    cy.get('.row > :nth-child(2) > .btn').should('be.visible').click();

    cy.wait(5000);

    // check that the deleted team no longer exists.
    cy.visit('/l/teams');
    cy.get('[data-cy="deleteTeamABCD"]').should('not.exist');
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
