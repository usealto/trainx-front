import { ChartOptions } from 'chart.js';
import Chart from 'chart.js/auto';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

//! Changing this constant will change every charts using it!

export const xAxisDatesOptions :any  = {
  type: 'category',
  axisPointer: {
    type: 'line',
  },
}

export const yAxisScoreOptions :any  = {
  type: 'value',
  name: 'Score (%)',
  nameLocation: 'middle',
  nameGap: 50,
  min: 0,
  max: 100,
  interval: 20,
  axisLabel: {
    formatter: '{value}',
  },
}

// ! DEPRECATED
export const chartDefaultOptions: ChartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    tooltip: {
      callbacks: {
        label(tooltipItem) {
          return `${tooltipItem.dataset.label}: ${tooltipItem.formattedValue}%`;
        },
      },
    },
    legend: {
      display: false,
      align: 'end',
      labels: {
        usePointStyle: true,
        boxWidth: 5,
        boxHeight: 5,
        pointStyle: 'circle',
      },
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: I18ns.leadHome.graph.period,
      },
      grid: {
        display: false,
      },
    },
    y: {
      display: true,
      min: 0,
      max: 105,
      ticks: {
        stepSize: 5,
        callback: (val, index) => {
          // No label for values other than multiples of 10
          return +val % 10 === 0 ? val : '';
        },
      },
      title: {
        display: true,
        text: I18ns.leadHome.graph.score,
      },
      grid: {
        color: (context) => {
          // No grid line for values other than multiples of 10
          if (context.tick.value % 10 === 0) {
            return Chart.defaults.borderColor.toString();
          }
          return '#00000000';
        },
      },
    },
  },
  hover: {
    mode: 'nearest',
    intersect: false,
  },
  elements: {
    point: {
      hoverRadius: 10,
    },
  },
};
