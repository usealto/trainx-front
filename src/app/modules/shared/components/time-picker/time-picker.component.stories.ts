import { type Meta, type StoryObj } from '@storybook/angular';
import { TimePickerComponent } from './time-picker.component';
import { ScoreDuration } from '../../models/score.model';

const meta: Meta<TimePickerComponent> = {
  title: 'Shared/TimePicker',
  component: TimePickerComponent,
  tags: ['autodocs'],
  render: (args: TimePickerComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<TimePickerComponent>;

export const TimePicker: Story = {};

export const TimePickerDuration: Story = {
  args: {
    duration: ScoreDuration.Year,
  },
};
