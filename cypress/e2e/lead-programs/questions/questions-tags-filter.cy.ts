describe('L/Programs Questions Tab', () => {
  beforeEach(() => {
    cy.loginToAuth0(Cypress.env('auth_username-admin'), Cypress.env('auth_password-admin'));
    cy.visit('/');

    cy.get('[data-cy="leadMenuPrograms"]').click();
    cy.get('[data-cy="selectedTab"]').eq(1).click();
  });

  let tagRealName = '';
  let tagTruncName = '';

  it('Collects a tag name', () => {
    cy.get('[data-cy="questionsTagsList"]')
      .last()
      .children()
      .then(($data) => {
        tagRealName = $data.text();
        tagTruncName = $data.text().slice(0, -3);
      });
  });

  it('Filters questions by collected tag', () => {
    cy.get('[data-cy="questionsTagFilter"]').click();

    cy.get('.ng-dropdown-header > input').clear();

    cy.intercept(
      'GET',
      Cypress.env('apiURL') +
        '/v1/questions?tagIds=e850e29e-c1a7-4f15-a2ef-decccf008ace&page=1&itemsPerPage=600',
    ).as('tagSearch');

    cy.get('.ng-dropdown-header > input').type(`${tagTruncName}{enter}`);

    cy.wait('@tagSearch');

    cy.get('[data-cy="questionsTagsList"]')
      .first()
      .children()
      .then(($data) => {
        const text = $data.text();
        expect(text.trim()).to.equal(tagRealName);
      });
  });
});
