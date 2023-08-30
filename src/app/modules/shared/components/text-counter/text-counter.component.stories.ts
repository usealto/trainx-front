import { type Meta, type StoryObj } from '@storybook/angular';
import { TextCounterComponent } from './text-counter.component';

const meta: Meta<TextCounterComponent> = {
  title: 'Shared/TextCounter',
  component: TextCounterComponent,
  tags: ['autodocs'],
  render: (args: TextCounterComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<TextCounterComponent>;

export const TextCounter: Story = {};

export const TextCounterWithControl: Story = {
  args: {
    control: 'question',
  },
};

export const TextCounterWithPlaceholder: Story = {
  args: {
    placeholder: 'Intitulé de la question',
  },
};

export const TextCounterWithHardLimit: Story = {
  args: {
    limit: 300,
  },
};

export const TextCounterWithSoftLimit: Story = {
  args: {
    limit: 300,
    softLimit: 150,
  },
};
