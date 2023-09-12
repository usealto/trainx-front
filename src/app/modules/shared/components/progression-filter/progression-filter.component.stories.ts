import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { ProgressionFilterComponent } from './progression-filter.component';

const meta: Meta<ProgressionFilterComponent> = {
  title: 'Shared/ProgressionFilter',
  component: ProgressionFilterComponent,
  tags: ['autodocs'],
  decorators: [componentWrapperDecorator((story) => `<div style="height: 26rem">${story}</div>`)],
  render: (args: ProgressionFilterComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<ProgressionFilterComponent>;

export const ProgressionFilter: Story = {};

export const ProgressionFilterDisabled: Story = {
  args: {
    disabled: true,
  },
};
