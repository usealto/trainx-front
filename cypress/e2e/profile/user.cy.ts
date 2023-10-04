describe('User Profile', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username'), Cypress.env('auth_password'));
    cy.visit('/');
  });

  const lastname1 = 'testing1';
  const lastname2 = 'testing2';
  it('changes lastname', () => {
    cy.get('[data-cy="profileImgBadge"]').click();
    cy.get('[data-cy="profile"]').click();

    cy.get('[data-cy="lastname"]').should('not.have.value', '');

    cy.get('[data-cy="lastname"]').clear();

    // changes lastname to lastname1

    cy.get('[data-cy="lastname"]').type(lastname1);

    cy.intercept('PATCH', '/v1/users/**').as('userUpdate');
    cy.get('[data-cy="save-button"]').click();

    cy.wait('@userUpdate');
    cy.reload();

    cy.get('[data-cy="lastname"]').should('have.value', lastname1);

    cy.get('[data-cy="lastname"]').clear();

    // changes lastname1 to lastname2 so that if lastname was already lastname1 we can be sure it changed

    cy.get('[data-cy="lastname"]').type(lastname2);
    cy.get('[data-cy="save-button"]').click();
    cy.wait('@userUpdate');

    cy.reload();
    cy.get('[data-cy="lastname"]').should('have.value', lastname2);
  });
});
