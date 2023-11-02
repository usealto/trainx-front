describe('L/Programs Questions Tab', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.intercept('GET', '/v1/**').as('loadData');
    cy.visit('/');
    cy.get('[data-cy="leadMenuPrograms"]').click();
    cy.wait('@loadData');
  });

  let questionTitle = '';

  it('Collects an existing question', () => {
    cy.intercept('GET', '/v1/programs/**').as('getProgram');
    cy.get('[data-cy="programCard"]').first().click().wait(500);
    cy.wait('@getProgram').wait(100);

    cy.get('[data-cy="questionsTab"]').click();
    cy.get('[data-cy="questionTitle"]')
      .first()
      .then(($data) => {
        questionTitle = $data.text().slice(0, 6);
      });
  });

  it('Searches the collected question by its title', () => {
    cy.intercept('GET', '/v1/questions*').as('fullQuestionList');
    cy.get('[data-cy="selectedTab"]').eq(1).click();

    cy.wait('@fullQuestionList').wait(100);

    cy.get('[data-cy="searchFilter"]').type(`${questionTitle}{enter}`);

    cy.get('[data-cy="questionsList"]').should('contain', questionTitle);
  });
});
