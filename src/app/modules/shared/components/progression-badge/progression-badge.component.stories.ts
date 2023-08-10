import { type Meta, type StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ProgressionBadgeComponent } from './progression-badge.component';
import { SharedModule } from '../../shared.module';

const meta: Meta<ProgressionBadgeComponent> = {
  title: 'Shared/ProgressionBadge',
  component: ProgressionBadgeComponent,
  tags: ['autodocs'],
  render: (args: ProgressionBadgeComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<ProgressionBadgeComponent>;

export const ProgressionBadge: Story = {
  args: {
    score: 0.8,
  },
};

export const ProgressionBadgeWithoutArrow: Story = {
  args: {
    score: 0.8,
    arrow: false,
  },
};
