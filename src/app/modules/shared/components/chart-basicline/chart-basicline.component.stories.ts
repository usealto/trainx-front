import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ChartBasiclineComponent } from './chart-basicline.component';
import { SharedModule } from '../../shared.module';
const meta: Meta<ChartBasiclineComponent> = {
  title: 'Shared/ChartBasiclineComponent',
  component: ChartBasiclineComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [SharedModule],
    }),
  ],
  render: (args: ChartBasiclineComponent) => ({
    props: {
      ...args,
    }
  }),
};

export default meta;
type Story = StoryObj<ChartBasiclineComponent>;

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
            name: 'Score',
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
            type: 'line',
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


export const Legend: Story = {
  args: {
    chartOption : {    
        legend: {
          data: ['Votre Score'],
        },
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
            name: 'Score',
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
            type: 'line',
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



export const Toolbox: Story = {
  args: {
    chartOption : {    
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            saveAsImage: { show: true },
          },
        },
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
            name: 'Score',
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
            type: 'line',
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


export const Tooltip: Story = {
  args: {
    chartOption : {    
        tooltip: {
          trigger: 'axis',
        },
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
            name: 'Score',
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
            type: 'line',
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
