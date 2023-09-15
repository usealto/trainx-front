import { EChartsOption } from 'echarts';
import { Injectable } from '@angular/core';

// Tooltip params interface used to override default typing
interface ITooltipParams {
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
  altoFormattingMultiline(eChartsOption: EChartsOption): EChartsOption {
    // replace null or 'n' values with 0 for every series begining with null or 'n'
    if (eChartsOption.series && eChartsOption.series && Array.isArray(eChartsOption.series)) {
      eChartsOption.series.forEach((serie) => {
        if (serie.type === 'line' && serie.data) {
          serie.data[0] = serie.data[0] === '-' ? 0 : serie.data[0] ?? 0;

          serie.emphasis = {
            scale: 4,
            itemStyle: {
              borderWidth: 3,
            },
          };

          serie.connectNulls = true;
          // serie.showSymbol = false;
          // serie.triggerLineEvent = true;
        }
      });
    }

    eChartsOption.tooltip = {
      trigger: 'item',
      padding: 0,
      borderColor: '#EAECF0',
      formatter: (params) => {
        const valueFormatter = Array.isArray(eChartsOption.series)
          ? eChartsOption.series[(params as ITooltipParams).seriesIndex].tooltip?.valueFormatter
          : eChartsOption.series?.tooltip?.valueFormatter;
        const formattedData = valueFormatter
          ? valueFormatter((params as ITooltipParams).data)
          : (params as ITooltipParams).data;

        return `
          <div style="box-shadow: 0px 2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.10); border-radius: 4px;">
            <div style="color: #667085; background-color: #F9FAFB; padding : 8px 10px 4px 10px;">
              <p>${(params as ITooltipParams).name}</p>
            </div>
            <div style="padding : 4px 10px 8px 10px; display: flex; align-items: center; gap: 10px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="11" viewBox="0 0 10 11" fill="none">
                <circle cx="5" cy="5.5" r="5" fill="${(params as ITooltipParams).color}"/>
              </svg>
              <p>${(params as ITooltipParams).seriesName} : <b style="color: ${
          (params as ITooltipParams).color
        }">${formattedData}<b></p>
            </div>
          </div>
        `;
      },
    };
    eChartsOption.legend = {
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
    };

    eChartsOption.grid = {
      left: '8%',
      top: '30',
      right: '5%',
    };

    return eChartsOption;
  }

  altoFormattingBar(eChartsOption: EChartsOption): EChartsOption {
    // replace null or 'n' values with 0 for every series begining with null or 'n'
    if (eChartsOption.series && eChartsOption.series && Array.isArray(eChartsOption.series)) {
      eChartsOption.series.forEach((serie) => {
        if (serie.type === 'bar') {
          serie.tooltip = {
            valueFormatter: (value) => {
              return (value as number) + ' %';
            },
          };
        }
      });
    }

    eChartsOption.tooltip = {
      trigger: 'item',
      borderWidth: 1,
      borderColor: '#EAECF0',
    };
    eChartsOption.legend = {
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
    };

    return eChartsOption;
  }
}
