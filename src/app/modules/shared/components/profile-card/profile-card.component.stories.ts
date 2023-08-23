import { type Meta, type StoryObj } from '@storybook/angular';
import { ProfileCardComponent } from './profile-card.component';

const meta: Meta<ProfileCardComponent> = {
  title: 'Shared/ProfileCard',
  component: ProfileCardComponent,
  tags: ['autodocs'],
  render: (args: ProfileCardComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<ProfileCardComponent>;

export const ProfileCard: Story = {
  args: {
    user: {
      id: 'id1',
      email: 'test@usealto.com',
      firstname: 'firstname',
      lastname: 'lastname',
    },
  },
};

export const ProfileCardWhiteText: Story = {
  args: {
    user: {
      id: 'id1',
      email: 'test@usealto.com',
      firstname: 'firstname',
      lastname: 'lastname',
    },
    isWhite: true,
  },
};
