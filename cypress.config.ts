import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: Cypress.env('baseURL'),
    experimentalStudio: true,
    viewportWidth: 1400,
    viewportHeight: 860,
  },

  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts',
  },
});
