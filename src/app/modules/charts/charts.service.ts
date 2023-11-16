import { EChartsOption } from 'echarts';
import { Injectable } from '@angular/core';
import { memoize } from 'src/app/core/utils/memoize/memoize';

// Tooltip params interface used to override default typing
export interface ITooltipParams {
  data: number | string;
  name: string;
  seriesName: string;
  color: string;
  seriesIndex: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChartsService {
  defaultThemeColors = [
    '#53b1fd',
    '#f97066',
    '#32d583',
    '#FDB022',
    '#9b8afb',
    '#f670c7',
    '#fd853a',
    '#8098f9',
    '#fd6f8e',
  ];

  @memoize()
  getDefaultThemeColors(index: number) {
    return this.defaultThemeColors[index % this.defaultThemeColors.length];
  }

  altoFormattingMultiline(eChartsOption: EChartsOption): EChartsOption {
    // replace null or 'n' values with 0 for every series begining with null or 'n'
    if (eChartsOption.series && Array.isArray(eChartsOption.series)) {
      eChartsOption.series.forEach((serie) => {
        if (serie.type === 'line' && serie.data) {
          serie.data[0] = serie.data[0] === '-' ? 0 : serie.data[0] ?? 0;
          (serie.smooth = 0.3),
            (serie.emphasis = {
              scale: 4,
              itemStyle: {
                borderWidth: 3,
              },
            });
          serie.lineStyle = {
            width: 3,
          };
          serie.connectNulls = true;
          if (serie.data.length === 1) {
            serie.showSymbol = true;
          }
        }
      });
    }

    eChartsOption.tooltip = {
      trigger: 'item',
      padding: 0,
      borderColor: '#EAECF0',
      formatter: (params) => {
        return this.tooltipFormatter(params as ITooltipParams, eChartsOption);
      },
      ...eChartsOption.tooltip,
    };
    eChartsOption.legend = {
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      ...eChartsOption.legend,
    };

    eChartsOption.grid = {
      left: '9%',
      bottom: '22%',
      top: '30',
      right: '1%',
      ...eChartsOption.grid,
    };
    // we only want this option to be trigger if there is only one xAxis value
    if (eChartsOption.xAxis && Array.isArray(eChartsOption.xAxis) && eChartsOption.xAxis.length === 1) {
      eChartsOption.xAxis[0].axisPointer = {
        show: true,
        triggerTooltip: false,
        type: 'line',
        label: {
          show: false,
        },
        triggerOn: 'mousemove|click',
      };
    }

    return eChartsOption;
  }

  altoFormattingRadar(eChartsOption: EChartsOption): EChartsOption {
    if (eChartsOption.series && Array.isArray(eChartsOption.series)) {
      eChartsOption.series.forEach((serie) => {
        if (serie.type === 'radar' && serie.data) {
          // serie.data[0] = serie.data[0] === '-' ? 0 : serie.data[0] ?? 0;
          // (emphasis: {
          //   lineStyle: {
          //     width: 4;
          //   }
          // });
          serie.emphasis = {
            lineStyle: {
              width: 4,
            },
          };
        }
      });
    }

    eChartsOption.tooltip = {
      show: false,
    };
    return eChartsOption;
  }

  private tooltipFormatter(params: ITooltipParams, eChartsOption: EChartsOption) {
    const valueFormatter = Array.isArray(eChartsOption.series)
      ? eChartsOption.series[params.seriesIndex].tooltip?.valueFormatter
      : eChartsOption.series?.tooltip?.valueFormatter;
    const formattedData = valueFormatter ? valueFormatter(params.data) : params.data;

    return `
    <div style="box-shadow: 0px 2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.10); border-radius: 4px;">
      <div style="color: #667085; background-color: #F9FAFB; padding : 8px 10px 4px 10px; font-weight: 600;">
        ${params.name}
      </div>
      <div style="padding : 4px 10px 8px 10px; display: flex; align-items: center; gap: 10px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="11" viewBox="0 0 10 11" fill="none">
          <circle cx="5" cy="5.5" r="5" fill="${params.color}"/>
        </svg>
        <p>${params.seriesName} : <b style="color: ${params.color};">${formattedData}<b></p>
      </div>
    </div>
  `;
  }
}
