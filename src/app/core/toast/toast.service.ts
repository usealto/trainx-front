import { Injectable, TemplateRef } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'none';

export interface Toast {
  text: string;
  template?: TemplateRef<any>;
  delay?: number;
  className?: string;
  autoHide?: boolean;
  type?: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts: Toast[] = [];

  show(t: Toast) {
    this.toasts.push(t);
  }

  remove(toast: Toast) {
    this.toasts = this.toasts.filter((t) => t !== toast);
  }

  clear() {
    this.toasts.splice(0, this.toasts.length);
  }
}
