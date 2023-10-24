# Cypress

### Prerequisites
Ask a coworker environnement variables to fill the `cypress.env.json` file. See the example file `cypress.env.example.json`

## Run

### Global Cypress Run

Run all tests at once and get a global picture :

```jsx
npm run cypress:run
```

It's the simplest way, but also the longest one. It will run all your tests in a row and you will have to wait for the end of the process to see the results.

## Manual Cypress Run


### With details

1. Start a local server

```jsx
npm run start
```

2. Open Cypress on another terminal

```jsx
npx cypress open
```

3. Select and run your test

Then you can select type testing (here we choose E2E Testing)

![Capture d’écran 2023-10-09 à 16 53 52](https://github.com/usealto/assessment-front/assets/107506961/d1cef231-ad17-4406-8362-e52181dd6128)

After that you must choose a browser to execute your tests (here we take Chrome)

![Capture d’écran 2023-10-09 à 16 54 02](https://github.com/usealto/assessment-front/assets/107506961/4440f098-d5f8-450c-8be0-13bcad899c4b)

And there you go, you can run all your spec files manually just by clicking them

![Capture d’écran 2023-10-09 à 16 55 11](https://github.com/usealto/assessment-front/assets/107506961/6d3d38f0-6c12-436a-a4a8-5a0b8fc6c415)

---

## Code coverage (currently not working)

- Build a production version of your app
`npm run build:preprod` or `npm run build:prod`

- Add instrumentation to your code
`npx nyc instrument dist dist --exclude-after-remap=false --complete-copy --in-place`
- Run a local server `http-server -p 4200`

- Execute tests, open cypress & 
`npx cypress open` or `npm run cypress:run`

Resource :
- cypress [doc](https://docs.cypress.io/guides/tooling/code-coverage#Instrumenting-code)
- run locally a [run server on a dist](https://codippa.com/run-dist-locally-angular/) and tips [if bug](https://github.com/AnandChowdhary/run-url/issues/1)
- tips [on code coverage](https://stackoverflow.com/questions/59470540/code-coverage-for-angular-spa-application-with-e2e-in-selenium-java-or-cypress/59934710#59934710)

## Write Cypress Tests

1. Run only one test at a time
2. Use proper selectors
3. Use intercept method
4. Use should method

Running every tests each time you want to check out if the current block is passing is a complete waste of time

⇒ Using `.only` command after declaring a `it` block allows you to run just the test you are working on

```jsx
it.only('test the following block', () => {
    cy.get('[data-cy="target"]').click()
  });
```

Use `data-cy` targets to select the DOM element you want to test

```html
<div data-cy="myTarget"></div>
```

```tsx
cy.get('[data-cy="myTarget"]')
```

The `cy.intercept` method allows you to catch a call and wait for it to finish before starting next tests relying on this one

```tsx
cy.intercept('GET', '/some/url/**')
```

Then give it an alias (by default `intercept` command yields  `undefined`)

```tsx
cy.intercept('GET', '/some/url/**').as('myAlias')
```

Execute an action so that a call can be intercepted

```tsx
cy.get('[data-cy="myTarget"]').click()
```

Wait for the call to resolve before going further

```tsx
cy.wait('@myAlias')
```

The `cy.should` command is quite useful in many situations especially when you want to verify a element state before executing an action on it

```tsx
cy.get('[data-cy="myTarget"]').should('have.value', 'enabled')
```

```tsx
cy.get('[data-cy="myTarget"]').click()
```

The command will re-execute during for 4 seconds which reduces the timeout chances due to an element not ready for an action to be executed
