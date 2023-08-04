import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonGroupComponent } from './button-group.component';
const meta: Meta<ButtonGroupComponent> = {
  title: 'Shared/ButtonGroup',
  component: ButtonGroupComponent,
  tags: ['autodocs'],
  render: (args: ButtonGroupComponent) => ({
    props: {
      ...args,
    }
  })
};

export default meta;
type Story = StoryObj<ButtonGroupComponent>;

export const Primary: Story = {
  args: {
    value : 'item1',
    items: [
      { label: 'Item 1', value: 'item1' },
      { label: 'Item 2', value: 'item2' },
    ],
  },
};
