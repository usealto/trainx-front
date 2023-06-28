describe('Lead Team', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('loads Home', function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[ng-reflect-router-link="l/teams"]').click();
    cy.get('alto-lead-team > :nth-child(1)').click();
    cy.get('alto-lead-team > :nth-child(1)').should('have.text', 'Équipes');
    /* ==== End Cypress Studio ==== */
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
