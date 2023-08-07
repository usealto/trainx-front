import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';

import { ChartsModule } from '../charts.module';
import { ChartBarComponent } from './chart-bar.component';
const meta: Meta<ChartBarComponent> = {
  title: 'Charts/ChartBarComponent',
  component: ChartBarComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ChartsModule],
    }),
  ],
  render: (args: ChartBarComponent) => ({
    props: {
      ...args,
    }
  }),
};

export default meta;
type Story = StoryObj<ChartBarComponent>;

export const Default: Story = {
  args: {
    chartOption : {    
        xAxis: [
          {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisPointer: {
              type: 'shadow',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Score (%)',
            nameLocation: 'middle',
            nameGap: 50,
            min: 0,
            max: 100,
            interval: 10,
            axisLabel: {
              formatter: '{value}',
            },
          },
        ],
        series: [
          {
            name: 'Votre Score',
            color: '#09479e',
            data: [20, 23, 45, 56, 13, 47, 40],
            type: 'bar',
            tooltip: {
              valueFormatter: (value) => {
                return (value as number) + ' %';
              },
            },
          },
        ]  
    }

  }
}



export const Colored: Story = {
  args: {
    chartOption : {    
        xAxis: [
          {
            type: 'category',
            data: ['Customer Success Manager', 'Business Manager', 'Sales representative', 'Sales development', 'Head of sales'],
            axisPointer: {
              type: 'shadow',
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Score (%)',
            nameLocation: 'middle',
            nameGap: 50,
            min: 0,
            max: 100,
            interval: 10,
            axisLabel: {
              formatter: '{value}',
            },
          },
        ],
        series: [
          {
            name: 'Score',
            color: '#1570EF',
            data: [{
              value : 20,
              itemStyle: {
                color: '#1570EF'
              }
            },
            {
              value : 23,
              itemStyle: {
                color: '#b90000'
              }
            },
            {
              value : 41,
              itemStyle: {
                color: '#FDB022'
              }
            },
            {
              value : 56,
              itemStyle: {
                color: '#7A5AF8'
              }
            },
            {
              value : 13,
              itemStyle: {
                color: '#EE46BC'
              }
            }],
            type: 'bar',
            tooltip: {
              valueFormatter: (value) => {
                return (value as number) + ' %';
              },
            },
          },
        ]  
    }

  }
}

