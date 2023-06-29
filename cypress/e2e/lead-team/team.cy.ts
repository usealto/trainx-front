describe('Lead Team', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
    cy.get('[ng-reflect-router-link="l/teams"]').click();
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('loads Team', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[data-cy="leadTeamTitle"]').click();
    cy.get('[data-cy="leadTeamTitle"]').should('have.text', 'Équipes');
    /* ==== End Cypress Studio ==== */
  });

  it('opens edit team panel', () => {
    cy.get('[data-cy="editTeam"]').first().click();
  });

  it('edits team shortname and check "already existing" error', () => {
    cy.get('[data-cy="editTeam"]').first().click();

    cy.get('[data-cy="editShortnameInput"]').click().wait(3000).clear().type('CYP');
    cy.get('[data-cy="btnSave"').click();

    cy.get('[data-cy="closeEditTeamPanel"]').click();
    cy.get('[data-cy="toastError"]').contains('409');
  });

  it('edits team longname and check "already existing" error', () => {
    cy.get('[data-cy="editTeam"]').first().click();

    cy.get('[data-cy="editLongnameInput"]').click().wait(3000).clear().type('Cypress');
    cy.get('[data-cy="btnSave"').click();

    cy.get('[data-cy="closeEditTeamPanel"]').click();
    cy.get('[data-cy="toastError"]').contains('409');
  });

  it('edits team longname and check it worked', () => {
    cy.get('[data-cy="editTeam"]').first().click();

    cy.get('[data-cy="editLongnameInput"]').click().wait(3000).clear().type('Cypress Edit');
    cy.get('[data-cy="btnSave"').click();

    cy.get('[data-cy="closeEditTeamPanel"]').click();
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[data-cy="teamLongname"').first().should('have.text', ' Cypress Edit ');
    /* ==== End Cypress Studio ==== */
  });

  it('edits team shortname and check it worked', () => {
    cy.get('[data-cy="editTeam"]').first().click();

    cy.get('[data-cy="editShortnameInput"]').click().wait(3000).clear().type('CYT');
    cy.get('[data-cy="btnSave"').click();

    cy.get('[data-cy="closeEditTeamPanel"]').click();

    cy.get('[data-cy="teamShortname"').first().should('have.text', 'CYT');
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
