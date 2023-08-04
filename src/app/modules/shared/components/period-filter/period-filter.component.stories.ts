import { type Meta, type StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { PeriodFilterComponent } from './period-filter.component';
import { SharedModule } from '../../shared.module';

const meta: Meta<PeriodFilterComponent> = {
  title: 'Shared/PeriodFilter',
  component: PeriodFilterComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [SharedModule],
    }),
  ],
  render: (args: PeriodFilterComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<PeriodFilterComponent>;

export const PeriodFilter: Story = {};
