import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'progressionPillArrow',
})
export class ProgressionPillArrowPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(score: number | undefined | null): string | SafeHtml {
    if (score === null || score === undefined) {
      return '';
    } else if (score > 0) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<svg width="15" height="20" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="arrow-up-right">
        <path id="Icon" d="M4.08301 10.4168L9.91634 4.5835M9.91634 4.5835H4.08301M9.91634 4.5835V10.4168" stroke="#12B76A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        </svg>`,
      );
    } else if (score < 0) {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<svg width="15" height="20" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="arrow-down-right">
        <path id="Icon" d="M4.58301 4.08333L10.4163 9.91666M10.4163 9.91666V4.08333M10.4163 9.91666H4.58301" stroke="#F04438" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        </svg>`,
      );
    } else {
      return this.sanitizer.bypassSecurityTrustHtml(
        `<i *ngIf="arrow === true" class="fs-4 align-middle bi-dash alto-neutral"/>`,
      );
    }
  }
}
