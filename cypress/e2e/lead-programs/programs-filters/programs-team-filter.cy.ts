describe('Lead Programs', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/');
    cy.wait('@loadData');
  });

  it('Access Lead Programs Page', function () {
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.get('[data-cy="leadMenuPrograms"]').click();
    cy.wait('@loadData');
    cy.get('[data-cy="main-div"]').find('alto-programs', { timeout: 10000 });

    cy.get('h1').should('have.text', 'Programmes');
  });

  it('Filters programs by team', function () {
    let teamShortname = '';
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.get('[data-cy="leadMenuPrograms"]').click();
    cy.wait('@loadData');
    cy.get('[data-cy="main-div"]').find('alto-programs', { timeout: 10000 });

    // Select a program card that already has at least one team

    cy.get('[data-cy="programCard"]').contains('Équipes').first().click().wait(500);

    // Select first team badge and collect shortname

    cy.get('[data-cy="teamBadge"]')
      .first()
      .then(($data) => {
        teamShortname = $data.text();

        // Goes back to programs page

        cy.get('.cancel-btn').click();
        cy.wait(500);

        // Click the team search dropdown's input and type the collected shortname

        cy.get(
          '[data-cy="programTeamFilter"] > .ng-select-multiple > .ng-select-container > .ng-arrow-wrapper',
        ).click();
        cy.get('.ng-dropdown-header > input').type(`${teamShortname}{enter}`);

        // Check the programs card list and get the first element

        cy.get('[data-cy="programCardList"]')
          .children()
          .eq(1)
          .within(() => {
            cy.get(`[data-cy="programCard"]`).first().click();
          });

        // Check the program teams badges list and check the list contains the collected shortname

        cy.get('[data-cy="teamBadge"]').contains(`${teamShortname}`);
      });
  });
});
