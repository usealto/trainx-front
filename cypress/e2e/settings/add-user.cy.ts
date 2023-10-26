describe('Add user form', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');
    cy.get('[data-cy="leadMenuSettings"]').click();
    cy.get('[data-cy="open-user-form"]').click();
  });

  it('add 2 user and delete them', () => {
    cy.get('[data-cy="add-line"]').click();

    // first user
    const uuid = () => Cypress._.random(0, 1e6);
    const id = uuid();

    cy.get('[data-cy="team"]').first().click();
    cy.get('[data-cy="team-badge"]').first().click();

    cy.get('[data-cy="firstname"]').first().type(`prénom+${id}`);
    cy.get('[data-cy="lastname"]').first().type(`nom+${id}`);

    cy.get('[data-cy="email"]').first().type(`e2e-testing-admin+${id}@usealto.com`);

    // last user
    const uuid2 = () => Cypress._.random(0, 1e6);
    const id2 = uuid2();

    cy.get('[data-cy="team"]').last().click();
    cy.get('[data-cy="team-badge"]').last().click();

    cy.get('[data-cy="firstname"]').last().type(`prénom+${id2}`);
    cy.get('[data-cy="lastname"]').last().type(`nom+${id2}`);

    cy.get('[data-cy="email"]').last().type(`e2e-testing-admin+${id2}@usealto.com`);

    cy.get('[data-cy="btnSave"]').click();

    //delete users
    cy.get('[data-cy="filterBySearch"]').last().click();
    cy.get('[data-cy="filterBySearch"]')
      .last()
      .within(() => {
        cy.intercept('GET', '').as('searchUser');
        cy.get('.form-control').clear().type(`prénom+${id2}`);
        cy.wait('@searchUser');
      });
    cy.wait(500);
    cy.get('[data-cy="btnDelete"]').click();
    cy.intercept('DELETE', '').as('userDeleted');
    cy.get('[data-cy="deleteButton"]').click();
    cy.wait('@userDeleted').wait(100);

    cy.get('[data-cy="filterBySearch"]').last().click();
    cy.get('[data-cy="filterBySearch"]')
      .last()
      .within(() => {
        cy.get('.form-control').clear().type(`prénom+${id}`);
      });
    cy.wait(500);
    cy.get('[data-cy="btnDelete"]').click();
    cy.get('[data-cy="deleteButton"]').click();
  });

  it('Try to create a user with an existing email', () => {
    cy.get('[data-cy="email"]').type(`romain@usealto.com`);

    cy.get('[data-cy="team"]').click();
    cy.get('[data-cy="team-badge"]').first().click();

    cy.get('[data-cy="firstname"]').type(`e2e-testing`);
    cy.get('[data-cy="lastname"]').type(`e2e-testing`);

    cy.get('[data-cy="email-error"]').should('contain.text', 'Une autre adresse email est identique.');
  });

  it('Try to create a user with an deleted email', () => {
    cy.get('[data-cy="email"]').type(`test@usealto.com`);

    cy.get('[data-cy="team"]').click();
    cy.get('[data-cy="team-badge"]').first().click();

    cy.get('[data-cy="firstname"]').type(`e2e-testing`);
    cy.get('[data-cy="lastname"]').type(`e2e-testing`);

    cy.get('[data-cy="email-error"]').should(
      'contain.text',
      'Vous ne pouvez pas re-créer un utilisateur supprimé.',
    );
  });

  it('Try to create user with empty fields', () => {
    cy.get('[data-cy="btnSave"]').click();

    cy.get('[data-cy="firstname-error"]').should('contain.text', 'Ce champ doit être rempli.');
    cy.get('[data-cy="lastname-error"]').should('contain.text', 'Ce champ doit être rempli.');
    cy.get('[data-cy="email-error"]').should('contain.text', 'Ce champ doit être rempli.');
    cy.get('[data-cy="team-error"]').should('contain.text', 'Ce champ doit être rempli.');
  });

  it.only('Try to create a user with incorrect email', () => {
    cy.get('[data-cy="team"]').click();
    cy.get('[data-cy="team-badge"]').first().click();

    cy.get('[data-cy="firstname"]').type(`e2e-testing`);
    cy.get('[data-cy="lastname"]').type(`e2e-testing`);

    cy.get('[data-cy="email"]').type(`testusealto.com`);
    cy.get('[data-cy="btnSave"]').click();

    cy.get('[data-cy="email-error"]').should('contain.text', 'Le format de l’adresse email est incorrect.');
  });
});
