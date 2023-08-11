import { type Meta, type StoryObj } from '@storybook/angular';
import { PaginationComponent } from './pagination.component';

const meta: Meta<PaginationComponent> = {
  title: 'Shared/Pagination',
  component: PaginationComponent,
  tags: ['autodocs'],
  render: (args: PaginationComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<PaginationComponent>;

export const Pagination: Story = {};

export const PaginationWithInfos: Story = {
  args: {
    collectionSize: 100,
    pageSize: 10,
    maxSize: 10,
    page: 3,
  },
};
