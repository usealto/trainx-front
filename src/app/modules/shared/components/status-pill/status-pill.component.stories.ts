import { type Meta, type StoryObj } from '@storybook/angular';
import { StatusPillComponent } from './status-pill.component';
import { ChallengeDtoApiStatusEnumApi } from '@usealto/sdk-ts-angular';

const meta: Meta<StatusPillComponent> = {
  title: 'Shared/StatusPill',
  component: StatusPillComponent,
  tags: ['autodocs'],
  render: (args: StatusPillComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<StatusPillComponent>;

export const StatusPillInProgress: Story = {
  args: {
    status: ChallengeDtoApiStatusEnumApi.InProgress
  },
};

export const StatusPillEnded: Story = {
  args: {
    status: ChallengeDtoApiStatusEnumApi.Ended
  },
};