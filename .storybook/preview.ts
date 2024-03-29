import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { applicationConfig, moduleMetadata, type Preview } from '@storybook/angular';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import '@angular/localize/init';
import docJson from '../documentation.json';
import { setCompodocJson } from '@storybook/addon-docs/angular';

setCompodocJson(docJson);

const decorators = [
  moduleMetadata({
    imports: [SharedModule],
  }),
  applicationConfig({
    providers: [importProvidersFrom(HttpClientModule), { provide: ActivatedRoute, useValue: {} }],
  }),
];

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: decorators,
};

export default preview;
