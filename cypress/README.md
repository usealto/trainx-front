## Install

You need to have the project up and running on port 4200 => [see README](https://github.com/usealto/assessment-front/blob/main/README.md#required)


### Global Cypress Run

In case you want to run all your tests at once and get a global picture you can use

```jsx
npm run cypress:run
```

## Run Cypress

If it’s the first time, you need to ask a coworker for the environnement file ⇒ `cypress.env.json` 

### With details

1. Start the project
2. Open Cypress
3. Click on a test to run it

Start a local server using 

```jsx
npm run start
```

---

Open Cypress Desktop app using 

```jsx
npx cypress open
```

Then you can select type testing (here we choose E2E Testing)

![Capture d’écran 2023-10-09 à 16 53 52](https://github.com/usealto/assessment-front/assets/107506961/d1cef231-ad17-4406-8362-e52181dd6128)

After that you must choose a browser to execute your tests (here we take Chrome)

![Capture d’écran 2023-10-09 à 16 54 02](https://github.com/usealto/assessment-front/assets/107506961/4440f098-d5f8-450c-8be0-13bcad899c4b)

And there you go, you can run all your spec files manually just by clicking them

![Capture d’écran 2023-10-09 à 16 55 11](https://github.com/usealto/assessment-front/assets/107506961/6d3d38f0-6c12-436a-a4a8-5a0b8fc6c415)

---

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
