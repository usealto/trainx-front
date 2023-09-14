import { EChartsOption, color } from 'echarts';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ChartsService {
  // constructor() { }

  altoFormattingMultiline(eChartsOption: EChartsOption) : EChartsOption {
    // replace null or 'n' values with 0 for every series begining with null or 'n'
    if (eChartsOption.series && eChartsOption.series && Array.isArray(eChartsOption.series)) {
      eChartsOption.series.forEach((serie) => {
        if(serie.type === 'line' && serie.data){
          serie.data[0] = serie.data[0] === "-" ? 0 : (serie.data[0] ?? 0);

          serie.emphasis = {
            scale: 4,
            itemStyle: {
              borderWidth : 3
            }
          }

          serie.connectNulls = true
          
        }
        
      });
    }

    eChartsOption.tooltip = {
      trigger: 'item',
      borderWidth: 1,
      borderColor: '#EAECF0',
      padding:0,
      formatter : `
      <div style="box-shadow: 0px 2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.10);">
        <div style="background-color: #F9FAFB; padding : 5px; border-radius: 4px 4px 0px 0px;">
          <strong>{b}</strong>
        </div>
        <div style="padding : 5px">
        {a} : {c}
        </div>        
      </div>`,
      valueFormatter: (value) => {
        return (value as number) + ' %';
      },
    }
    eChartsOption.legend = {
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
    }

    return eChartsOption
  }



  altoFormattingBar(eChartsOption: EChartsOption) : EChartsOption {
    // replace null or 'n' values with 0 for every series begining with null or 'n'
    if (eChartsOption.series && eChartsOption.series && Array.isArray(eChartsOption.series)) {
      eChartsOption.series.forEach((serie) => {
        if(serie.type === 'bar' ){
          serie.tooltip = {
            valueFormatter: (value) => {
              return (value as number) + ' %';
            },
          }       
        }
      });
    }

    eChartsOption.tooltip = {
      trigger: 'item',
      borderWidth: 1,
      borderColor: '#EAECF0',
    }
    eChartsOption.legend = {
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
    }

    return eChartsOption
  }
}


