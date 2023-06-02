import { Directive, ElementRef, HostBinding, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[altoAutoResizeTextarea]',
  standalone: true,
})
export class AutoResizeTextareaDirective implements OnInit {
  host: any;

  @HostBinding('class.p-inputtext') inputtext = true;
  @HostBinding('class.p-corner-all') uiCornerAll = true;
  @HostBinding('class.p-state-default') uiStateDefault = true;
  @HostBinding('class.p-component') uiWidget = true;

  // Entier sans le px
  @Input() minHeight = 34;

  @HostListener('input', ['$event'])
  onInput(e: any) {
    if (e.target.scrollHeight > this.minHeight + 10) {
      e.target.style.height = '1px';
      e.target.style.height = 4 + e.target.scrollHeight + 'px';
    } else {
      e.target.style.height = this.minHeight + 'px';
    }
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
  }
}
