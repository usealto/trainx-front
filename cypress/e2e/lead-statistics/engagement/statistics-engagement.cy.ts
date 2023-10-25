describe('Lead Statistics Engagement', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/l/statistics/engagement', {});
  });

  it('Access Lead Statistics Engagement Page', () => {
    cy.get('[data-cy="statEngagementTitle1"]').should('contain.text', "Activité de l'entreprise");
  });

  it('Gets right leaderboard color', () => {
    cy.wait(500);
    cy.get('[data-cy="leaderboard-line"] > p').first().should('have.class', 'alto-green');
  });

  it.only('Gets right leaderboard order', () => {
    cy.intercept('GET', '').as('loadData');
    cy.visit('/l/statistics/engagement', {});

    cy.wait('@loadData').wait(100);

    cy.get('[data-cy="line-score"]')
      .first()
      .then((data) => {
        cy.get('[data-cy="line-score"]')
          .eq(1)
          .then((data2) => expect(+data.text()).above(+data2.text()));
      });
  });
});
