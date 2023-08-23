import { type Meta, type StoryObj } from '@storybook/angular';
import { SearchComponent } from './search.component';

const meta: Meta<SearchComponent> = {
  title: 'Shared/Search',
  component: SearchComponent,
  tags: ['autodocs'],
  render: (args: SearchComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<SearchComponent>;

export const Search: Story = {};

export const SearchWithPersonalizedPlaceholder: Story = {
  args: {
    placeholder: 'Personalized placeholder',
  },
};
