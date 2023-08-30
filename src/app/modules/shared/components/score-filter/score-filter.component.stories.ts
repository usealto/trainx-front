import { type Meta, type StoryObj } from '@storybook/angular';
import { ScoreFilterComponent } from './score-filter.component';

const meta: Meta<ScoreFilterComponent> = {
  title: 'Shared/ScoreFilter',
  component: ScoreFilterComponent,
  tags: ['autodocs'],
  render: (args: ScoreFilterComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<ScoreFilterComponent>;

export const ScoreFilter: Story = {};

// TODO: Add story with SelectedItems

export const ScoreFilterDisabled: Story = {
  args: {
    disabled: true,
  },
};
