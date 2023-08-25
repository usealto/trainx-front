import { type Meta, type StoryObj } from '@storybook/angular';
import { TrainingCardComponent } from './training-card.component';

const meta: Meta<TrainingCardComponent> = {
  title: 'Shared/TrainingCard',
  component: TrainingCardComponent,
  tags: ['autodocs'],
  render: (args: TrainingCardComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<TrainingCardComponent>;

export const TrainingCard: Story = {
  args: {
    data: {
      programId: 'ABOUH0DLEF',
      title: 'programme 1',
      score: 80,
      expectation: 90,
      isProgress: true,
    },
  },
};
