describe('User Profile', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username'), Cypress.env('auth_password'));
    cy.visit('/');
    cy.wait(1500);
  });

  /* ==== Test Created with Cypress Studio ==== */
  it('changes lastname', function () {
    cy.get('[data-cy="profile"]').click();
    cy.get('[data-cy="lastname"]').clear();
    cy.get('[data-cy="lastname"]').type('testing2');
    cy.get('[data-cy="save-button"]').click();
    cy.reload();
    cy.get('[data-cy="lastname"]').should('have.value', 'testing2');
  });
});
