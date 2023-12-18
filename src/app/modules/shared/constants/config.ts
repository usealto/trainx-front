import { I18ns } from 'src/app/core/utils/i18n/I18n';

//! Changing this constant will change every charts using it!

export const xAxisDatesOptions: any = {
  type: 'category',
  name: I18ns.charts.timeLabel,
  nameLocation: 'middle',
  nameGap: 35,
  axisPointer: {
    type: 'line',
  },
  axisTick: { show: false },
  axisLine: { show: false },
  nameTextStyle: { fontWeight: 600, fontFamily: 'PlusJakartaSans' },
};

export const yAxisScoreOptions: any = {
  type: 'value',
  name: I18ns.charts.scoreLabel,
  nameLocation: 'middle',
  nameGap: 50,
  min: 0,
  max: 100,
  interval: 20,
  axisLabel: {
    formatter: '{value}',
  },
  nameTextStyle: { fontWeight: 600, fontFamily: 'PlusJakartaSans' },
};

export const legendOptions: any = {
  show: true,
  textStyle: { color: '#667085' },
};