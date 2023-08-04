import { type Meta, type StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ProgressionFilterComponent } from './progression-filter.component';
import { SharedModule } from '../../shared.module';

const meta: Meta<ProgressionFilterComponent> = {
  title: 'Shared/ProgressionFilter',
  component: ProgressionFilterComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [SharedModule],
    }),
  ],
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
