import { type Meta, type StoryObj } from '@storybook/angular';
import { ProgramCardListComponent } from './program-card-list.component';

const meta: Meta<ProgramCardListComponent> = {
  title: 'Shared/ProgramCardList',
  component: ProgramCardListComponent,
  tags: ['autodocs'],
  render: (args: ProgramCardListComponent) => ({
    props: {
      ...args,
    },
  }),
};

export default meta;
type Story = StoryObj<ProgramCardListComponent>;

export const ProgramCardListHome: Story = {};
