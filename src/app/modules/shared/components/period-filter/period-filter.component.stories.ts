import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { PeriodFilterComponent } from './period-filter.component';

const meta: Meta<PeriodFilterComponent> = {
  title: 'Shared/PeriodFilter',
  component: PeriodFilterComponent,
  tags: ['autodocs'],
  decorators: [componentWrapperDecorator((story) => `<div style="height: 12rem">${story}</div>`)],
  render: (args: PeriodFilterComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<PeriodFilterComponent>;

export const PeriodFilter: Story = {};
