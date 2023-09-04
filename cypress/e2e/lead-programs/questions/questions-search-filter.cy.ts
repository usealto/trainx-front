import { expect } from 'chai';

describe('L/Programs Questions Tab', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');

    cy.get('[ng-reflect-router-link="l/programs"]').click();
  });

  let questionTitle = '';

  it('Collects an existing question', () => {
    cy.get('[data-cy="programCard"]').first().click().wait(500);

    cy.get('[data-cy="questionsTab"]').click();
    cy.get('[data-cy="questionTitle"]')
      .last()
      .then(($data) => {
        questionTitle = $data.text();
      });
  });

  it('Searches the collected question by its title', () => {
    cy.get('[data-cy="selectedTab"]').eq(1).click();

    cy.get('[data-cy="searchFilter"]').type(`${questionTitle}{enter}`);

    cy.wait(500);

    cy.get('[data-cy="questionsList"]').should('contain', questionTitle);
  });
});
