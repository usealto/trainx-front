describe('Lead Collaboration', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});

    cy.get('[data-cy="leadMenuCollaboration"]').click();
  });

  //TODO write a test to check that collaborations are not checked
});
