describe('Lead Programs', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');
  });
  it('Access Lead Programs Page', function () {
    cy.get('[ng-reflect-router-link="l/programs"]').click();
    cy.get('h1').should('have.text', 'Programmes');
  });

  it('Search Programs and check if title or description is right', function () {
    cy.get('[ng-reflect-router-link="l/programs"]').click();
    cy.get('.d-inline-block > .search-group > .form-control').type('test');
    cy.get(
      ':nth-child(1) > alto-program-card > :nth-child(1) > .panel > .card-bottom > :nth-child(4)',
    ).click();
    cy.get('.ng-invalid > :nth-child(1) > .col-6').click();
    cy.get(':nth-child(1) > .col-6 > .form-control, :nth-child(3) > .col-6 > .form-control')
      .filter((i, el: HTMLInputElement) => {
        return el.value.toLocaleLowerCase().includes('test');
      })
      .should('have.length.above', 0);
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('filter programs by team', function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[ng-reflect-router-link="l/programs"]').click();
    cy.wait(3000);

    cy.get(
      '.col-7 > alto-dropdown-filter > .ng-select-multiple > .ng-select-container > .ng-arrow-wrapper',
    ).click();
    cy.get('.ng-dropdown-panel-items .ng-option').contains('ABD').click();
    cy.get(
      '.col-7 > alto-dropdown-filter > .ng-select-multiple > .ng-select-container > .ng-arrow-wrapper',
    ).click();
    cy.get(
      ':nth-child(1) > alto-program-card > :nth-child(1) > .panel > .card-bottom > alto-colored-pill-list > span',
    ).contains('ABD');
  });
});
