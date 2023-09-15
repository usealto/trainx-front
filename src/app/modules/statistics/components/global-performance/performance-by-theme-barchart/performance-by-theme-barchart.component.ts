import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { ScoreDtoApi } from '@usealto/sdk-ts-angular';
import { I18ns } from 'src/app/core/utils/i18n/I18n';


@Component({
  selector: 'alto-performance-by-theme-barchart',
  templateUrl: './performance-by-theme-barchart.component.html',
  styleUrls: ['./performance-by-theme-barchart.component.scss']
})
export class PerformanceByThemeBarchartComponent implements OnChanges {
  items: ScoreDtoApi[] = [];
  selectedItems: ScoreDtoApi[] = [];
  I18ns = I18ns;

  scoreCount = 0;
  chartOption: any = {};

  // constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
      console.log('here 1');
      
  }
  filterTagsAndPrograms(items: ScoreDtoApi[]) {
    console.log('here 2');
    
    // this.selectedItems = items;
    // this.getScores().subscribe();
  }

}
