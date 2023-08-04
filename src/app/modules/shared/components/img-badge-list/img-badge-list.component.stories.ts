import { type Meta, type StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ImgBadgeListComponent } from './img-badge-list.component';
import { SharedModule } from '../../shared.module';

const meta: Meta<ImgBadgeListComponent> = {
  title: 'Shared/ImgBadgeList',
  component: ImgBadgeListComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [SharedModule],
    }),
  ],
  render: (args: ImgBadgeListComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<ImgBadgeListComponent>;

export const ImgBadgeList: Story = {
  args: {
    users: [
      {
        id: 'id1',
        email: 'user1@usealto.com',
        firstname: 'user1',
        lastname: 'user1',
      },
      {
        id: 'id2',
        email: 'user2@usealto.com',
        firstname: 'user2',
        lastname: 'user2',
      },
      {
        id: 'id3',
        email: 'user3@usealto.com',
        firstname: 'user3',
        lastname: 'user3',
      },
      {
        id: 'id4',
        email: 'user4@usealto.com',
        firstname: 'user4',
        lastname: 'user4',
      },
      {
        id: 'id5',
        email: 'user5@usealto.com',
        firstname: 'user5',
        lastname: 'user5',
      },
    ],
  },
};

export const ImgBadgeListWithLimit: Story = {
  args: {
    users: [
      {
        id: 'id1',
        email: 'user1@usealto.com',
        firstname: 'user1',
        lastname: 'user1',
      },
      {
        id: 'id2',
        email: 'user2@usealto.com',
        firstname: 'user2',
        lastname: 'user2',
      },
      {
        id: 'id3',
        email: 'user3@usealto.com',
        firstname: 'user3',
        lastname: 'user3',
      },
      {
        id: 'id4',
        email: 'user4@usealto.com',
        firstname: 'user4',
        lastname: 'user4',
      },
      {
        id: 'id5',
        email: 'user5@usealto.com',
        firstname: 'user5',
        lastname: 'user5',
      },
    ],
    limit: 3,
  },
};
