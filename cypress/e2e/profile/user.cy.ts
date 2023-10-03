describe('User Profile', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username'), Cypress.env('auth_password'));
    cy.visit('/');
    cy.wait(1500);
  });

  const lastname1 = 'testing1';
  const lastname2 = 'testing2';
  it('changes lastname', function () {
    cy.get('[data-cy="profileImgBadge"]').click();
    cy.get('[data-cy="profile"]').click();

    cy.get('[data-cy="lastname"]').should('not.have.value', '');

    cy.get('[data-cy="lastname"]').clear();

    // changes lastname to lastname1

    cy.get('[data-cy="lastname"]').type(lastname1);
    cy.get('[data-cy="save-button"]').click();
    cy.reload();
    cy.get('[data-cy="lastname"]').should('have.value', lastname1);

    cy.get('[data-cy="lastname"]').clear();

    // changes lastname1 to lastname2 so that if lastname was already lastname1 we can be sure it changed

    cy.get('[data-cy="lastname"]').type(lastname2);
    cy.get('[data-cy="save-button"]').click();
    cy.reload();
    cy.get('[data-cy="lastname"]').should('have.value', lastname2);
  });
  // it('001', function () {
  //   /* ==== Generated with Cypress Studio ==== */
  //   cy.get('[data-cy="profileImgBadge"] > img').click();
  //   cy.get('[data-cy="profile"] > div').click();
  //   cy.get('[data-cy="lastname"]').should('not.be.checked');
  //   /* ==== End Cypress Studio ==== */
  // });
});
