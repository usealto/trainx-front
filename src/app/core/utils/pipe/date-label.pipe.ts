import { Pipe, PipeTransform } from '@angular/core';
import {
  format,
  isToday,
  isYesterday,
  differenceInDays,
} from 'date-fns';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Pipe({
  name: 'dateLabel'
})
export class DateLabelPipe implements PipeTransform {
  transform(date: Date): string {
    if (isToday(date)) {
      return I18ns.collaboration.dateLabels.today;
    }
    if (isYesterday(date)) {
      return I18ns.collaboration.dateLabels.yesterday;
    }

    const diff = differenceInDays(new Date(), date);
    if (diff < 7) {
      return I18ns.collaboration.dateLabels.daysCount.replace('{{}}', diff.toFixed());
    }

    return format(date, 'dd/MM/yyyy');
  }
}