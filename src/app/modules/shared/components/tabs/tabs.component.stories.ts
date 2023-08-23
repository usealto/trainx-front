import { type Meta, type StoryObj } from '@storybook/angular';
import { TabsComponent } from './tabs.component';

const meta: Meta<TabsComponent> = {
  title: 'Shared/Tabs',
  component: TabsComponent,
  tags: ['autodocs'],
  render: (args: TabsComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<TabsComponent>;

export const Tabs: Story = {
  args: {
    data: [
      { label: 'First', value: '1' },
      { label: 'Second', value: '2' },
    ],
  },
};
