import { componentWrapperDecorator, type Meta, type StoryObj } from '@storybook/angular';
import { DropdownFilterComponent } from './dropdown-filter.component';

const meta: Meta<DropdownFilterComponent> = {
  title: 'Shared/DropdownFilter',
  component: DropdownFilterComponent,
  tags: ['autodocs'],
  decorators: [componentWrapperDecorator((story) => `<div style="height: 20rem">${story}</div>`)],
  render: (args: DropdownFilterComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<DropdownFilterComponent>;

export const DropdownFilter: Story = {
  args: {
    data: [
      { id: 'AFE8238asdfr4', name: 'team 1' },
      { id: 'FF1238asdfr4', name: 'team 2' },
      { id: '9DAA38asdfr4', name: 'team 3' },
      { id: 'AEE123qsd', name: 'team 4' },
    ],
    isColored: true,
    multiple: false,
  },
};

export const DropdownWithPlaceholder: Story = {
  args: {
    data: [
      { id: 'AFE8238asdfr4', name: 'team 1' },
      { id: 'FF1238asdfr4', name: 'team 2' },
      { id: '9DAA38asdfr4', name: 'team 3' },
      { id: 'AEE123qsd', name: 'team 4' },
    ],
    placeholder: 'Teams selection',
  },
};

export const DropdownWithDisplayLabel: Story = {
  args: {
    data: [
      { id: 'AFE8238asdfr4', name: 'team 1', shortName: 'T1' },
      { id: 'FF1238asdfr4', name: 'team 2', shortName: 'T2' },
      { id: '9DAA38asdfr4', name: 'team 3', shortName: 'T3' },
      { id: 'AEE123qsd', name: 'team 4', shortName: 'T4' },
    ],
    displayLabel: 'shortName',
  },
};

export const DropdownColored: Story = {
  args: {
    data: [
      { id: 'AFE8238asdfr4', name: 'team 1' },
      { id: 'FF1238asdfr4', name: 'team 2' },
      { id: '9DAA38asdfr4', name: 'team 3' },
      { id: 'AEE123qsd', name: 'team 4' },
    ],
    isColored: true,
  },
};

export const DropdownSingleChoice: Story = {
  args: {
    data: [
      { id: 'AFE8238asdfr4', name: 'team 1' },
      { id: 'FF1238asdfr4', name: 'team 2' },
      { id: '9DAA38asdfr4', name: 'team 3' },
      { id: 'AEE123qsd', name: 'team 4' },
    ],
    multiple: false,
  },
};

export const DropdownWithSelectedItems: Story = {
  args: {
    data: [
      { id: 'AFE8238asdfr4', name: 'team 1' },
      { id: 'FF1238asdfr4', name: 'team 2' },
      { id: '9DAA38asdfr4', name: 'team 3' },
      { id: 'AEE123qsd', name: 'team 4' },
    ],
    selectedItems: [
      { id: 'AFE8238asdfr4', name: 'team 1' },
      { id: '9DAA38asdfr4', name: 'team 3' },
    ],
  },
};

export const DropdownWithPosition: Story = {
  args: {
    data: [
      { id: 'AFE8238asdfr4', name: 'team 1' },
      { id: 'FF1238asdfr4', name: 'team 2' },
      { id: '9DAA38asdfr4', name: 'team 3' },
      { id: 'AEE123qsd', name: 'team 4' },
    ],
    position: 'auto',
  },
};

export const DropdownWithSearchDisabled: Story = {
  args: {
    data: [
      { id: 'AFE8238asdfr4', name: 'team 1' },
      { id: 'FF1238asdfr4', name: 'team 2' },
      { id: '9DAA38asdfr4', name: 'team 3' },
      { id: 'AEE123qsd', name: 'team 4' },
    ],
    enableSearch: false,
  }
};

export const DropdownDisabled: Story = {
  args: {
    data: [
      { id: 'AFE8238asdfr4', name: 'team 1' },
      { id: 'FF1238asdfr4', name: 'team 2' },
      { id: '9DAA38asdfr4', name: 'team 3' },
      { id: 'AEE123qsd', name: 'team 4' },
    ],
    disabled: true,
  },
};
