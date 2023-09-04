import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[altoAutoResizeTextarea]',
  standalone: true,
})
export class AutoResizeTextareaDirective implements OnInit {
  host: any;

  /**
   * Integer without Pixels
   */
  @Input() minHeight = 33;

  @HostListener('input', ['$event'])
  onInput(e: any) {
    this.resize(e.target);
  }

  constructor(el: ElementRef) {
    if (el.nativeElement.nodeName !== 'TEXTAREA') {
      console.warn('Utiliser avec un text area: ' + el.nativeElement.nodeName);
      return;
    }
    this.host = el.nativeElement;
  }

  ngOnInit(): void {
    if (this.minHeight !== 0) {
      this.host.style.minHeight = this.minHeight + 'px';
      this.host.style.height = this.minHeight + 'px';
    }
    this.resize(this.host);
  }

  resize(e: any) {
    if (e.scrollHeight > this.minHeight + 10) {
      e.style.height = '1px';
      e.style.height = 4 + e.scrollHeight + 'px';
    } else {
      e.style.height = this.minHeight + 'px';
    }
  }
}
