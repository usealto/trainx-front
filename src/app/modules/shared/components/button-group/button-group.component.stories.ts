
import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonGroupComponent } from './button-group.component';
const meta: Meta<ButtonGroupComponent> = {
  component: ButtonGroupComponent,
};

export default meta;
type Story = StoryObj<ButtonGroupComponent>;

export const Primary: Story = {
  render: () => ({
    props: {
      primary: true,
      label: 'ButtonGroup',
    },
  }),
};
