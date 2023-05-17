import { ChartOptions } from 'chart.js';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

//! Changing this constant will change every charts using it!
/**
 * To override scales :
 * ```
  const options = {
    ...chartDefaultOptions,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: I18ns...,
        },
      },
    },
  };
 * ```
 */
export const chartDefaultOptions: ChartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
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
    },
    y: {
      display: true,
      min: 0,
      max: 100,
      title: {
        display: true,
        text: I18ns.leadHome.graph.score,
      },
    },
  },
};
