import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { NotFoundComponent } from './not-found.component';



const meta: Meta<NotFoundComponent> = {
  title: 'Layout/NotFoundComponent',
  component: NotFoundComponent,
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/angular/configure/story-layout
    layout: 'fullscreen',
  },
  decorators: [
    moduleMetadata({
      declarations: [NotFoundComponent],
      imports: [CommonModule],
    }),
  ],
};

export default meta;
type Story = StoryObj<NotFoundComponent>;



export const Page: Story = {
  render: (args: NotFoundComponent) => ({
    props: args,
  }),
};

