import { EChartsOption } from 'echarts';
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
      trigger: 'axis',
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
      trigger: 'axis',
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


