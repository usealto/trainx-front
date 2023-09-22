import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://app-develop.usealto.com',
    experimentalStudio: true,
    viewportWidth: 1400,
    viewportHeight: 860,
    video: false,
  },

  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: '**/*.cy.ts',
  },
});
