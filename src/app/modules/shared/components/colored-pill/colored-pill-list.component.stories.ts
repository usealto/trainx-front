import { type Meta, type StoryObj } from '@storybook/angular';
import { ColoredPillListComponent } from './colored-pill-list.component';

const meta: Meta<ColoredPillListComponent> = {
  title: 'Shared/ColoredPill',
  component: ColoredPillListComponent,
  tags: ['autodocs'],
  render: (args: ColoredPillListComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<ColoredPillListComponent>;

export const List: Story = {
  args: {
    limit: 0,
    hasDynamicColor: false,
    data: [
      { name: 'test', id: 'AFE8238asdfr4' },
      { name: 'alpha', id: 'FF1238asdfr4' },
      { name: 'beta', id: '9DAA38asdfr4' },
      { name: 'gamma', id: 'AEE123qsd' },
    ],
  },
};

export const ListColored: Story = {
  args: {
    limit: 0,
    hasDynamicColor: true,
    data: [
      { name: 'test', id: 'AFE8238asdfr4' },
      { name: 'alpha', id: 'FF1238asdfr4' },
      { name: 'beta', id: '9DAA38asdfr4' },
      { name: 'gamma', id: 'AEE123qsd' },
    ],
  },
};

export const ListLimited: Story = {
  args: {
    limit: 3,
    hasDynamicColor: false,
    data: ['test', 'alpha', 'beta', 'gamma'],
  },
};

export const ListTooltip: Story = {
  args: {
    limit: 3,
    hasDynamicColor: false,
    data: ['test', 'alpha', 'beta', 'gamma'],
    tooltipOnLimit: ['test', 'alpha', 'beta', 'gamma'],
  },
};
