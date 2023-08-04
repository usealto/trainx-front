describe('Lead Team', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/', {});
    cy.get('[ng-reflect-router-link="l/teams"]').click();
  });

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

  it('Filters members by score', () => {
    const score = 50;

    cy.get('[data-cy="filterByScore"]').click();

    cy.get('.ng-dropdown-header > input').clear();
    cy.get('.ng-dropdown-header > input')
      .type(`${score}`)
      .then(() => {
        cy.get('.ng-dropdown-panel > .ng-dropdown-panel-items > div > .ng-option').first().click();
      });

    cy.get('[data-cy="scoreProgressBar"]')
      .first()
      .then(($element) => $element.attr('style'))
      .invoke('match', /\d+/g)
      .then((res) => +res[0])
      .should('be.lessThan', score);
  });

  it('Filters members using search input', () => {
    cy.get('[data-cy="profileCard"] > .profile > .names-container > .email')
      .first()
      .click()
      .then(($data) => {
        const searchedText = $data.text().slice(0, 3);
        const text = $data.text();

        cy.get('[data-cy="filterBySearch"]').click();

        cy.get('.form-control').clear();
        cy.get('.form-control').type(`${searchedText}`);

        cy.get('[data-cy="profileCard"] > .profile > .names-container > .email')
          .first()
          .should('have.text', text);
      });
  });
});
