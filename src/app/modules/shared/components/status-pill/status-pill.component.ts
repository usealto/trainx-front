import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { ChallengeDtoApiStatusEnumApi } from 'src/app/sdk';

@Component({
  selector: 'alto-status-pill',
  templateUrl: './status-pill.component.html',
  styleUrls: ['./status-pill.component.scss'],
})
export class StatusPillComponent implements OnChanges {
  @Input() status!: ChallengeDtoApiStatusEnumApi;
  loaded = false;
  class = '';

  ngOnChanges(changes: SimpleChanges): void {
    this.loaded = true;
    this.class = this.getColor();
  }

  getColor() {
    if (this.status === ChallengeDtoApiStatusEnumApi.InProgress) {
      return 'ongoing';
    } else if (this.status === ChallengeDtoApiStatusEnumApi.Ended) {
      return 'ended';
    } else {
      return 'incoming';
    }
  }

  @memoize()
  getLabel(cls: string) {
    return I18ns.shared.status[cls as keyof typeof I18ns.shared.status];
  }
}
