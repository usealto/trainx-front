import type { Meta, StoryObj } from '@storybook/angular';
import { ChartBasiclineComponent } from './chart-basicline.component';
const meta: Meta<ChartBasiclineComponent> = {
  title: 'Shared/ChartBasiclineComponent',
  component: ChartBasiclineComponent,
  tags: ['autodocs'],
  render: (args: ChartBasiclineComponent) => ({
    props: args,
  }),
};

export default meta;
type Story = StoryObj<ChartBasiclineComponent>;

export const Ideal: Story = {
  args: {
    chartOption: {
      ...ChartBasiclineComponent.prototype.chartDefaultOption,  
    },
  },
};