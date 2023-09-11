import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { ChartBasiclineComponent } from './chart-basicline.component';
import { ChartsModule } from '../charts.module';
const meta: Meta<ChartBasiclineComponent> = {
  title: 'Charts/ChartBasiclineComponent',
  component: ChartBasiclineComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ChartsModule],
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
              type: 'line',
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
            type: 'line',
            connectNulls : true,
            tooltip: {
              valueFormatter: (value) => {
                return (value as number) + ' %';
              },
            },
            emphasis: {
              scale: 4,
              itemStyle: {
                borderWidth : 3
              }
            },
          },
        ],
        tooltip: {
          trigger: 'axis',
          borderWidth: 1,
          borderColor: '#EAECF0',
        },
        legend: {
          bottom: 0,
          icon: 'circle',
          itemWidth: 8,
        },
    }

  }
}


export const Feature_Legend: Story = {
  args: {
    chartOption : {    
        legend: {
          bottom: 0,
          icon: 'circle',
          itemWidth: 8,
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



export const Feature_Toolbox: Story = {
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


export const Feature_Tooltip: Story = {
  args: {
    chartOption : {    
        tooltip: {
          trigger: 'axis',
          borderWidth: 1,
          borderColor: '#EAECF0',
        },
        xAxis: [
          {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            axisPointer: {
              type: 'line',
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
            type: 'line',
            tooltip: {
              valueFormatter: (value) => {
                return (value as number) + ' %';
              },
            },
            emphasis: {
                scale: 4,
                itemStyle: {
                  borderWidth : 3
                }
            },
          },
        ]  
    }

  }
}

export const Data_Begining: Story = {
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
            data: [20, 23, 45,'-','-','-','-'],
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


export const Data_End: Story = {
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
            data: ['-','-','-','-',13, 47, 40],
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


export const Data_MiddleMissing: Story = {
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
            data: [20, 23, '-', 56, 13, 47, 40],
            type: 'line',
            connectNulls : true,
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


export const Data_OnePoint: Story = {
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
            data: ['-','-', '-', '-', 13, '-','-',],
            type: 'line',
            connectNulls : true,
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


export const Data_MultiLine: Story = {
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
            type: 'line',
            connectNulls : true,
            tooltip: {
              valueFormatter: (value) => {
                return (value as number) + ' %';
              },
            },
          },
          {
            name: 'Votre Score',
            color: '#039855',
            data: ['-', '-', 15, 85, 60, 65, 45],
            type: 'line',
            connectNulls : true,
            tooltip: {
              valueFormatter: (value) => {
                return (value as number) + ' %';
              },
            },
          },
          {
            name: 'Votre Score',
            color: '#FDB022',
            data: [80, 70, 73, 68, 62, 76, 55],
            type: 'line',
            connectNulls : true,
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