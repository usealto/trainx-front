import { Injectable } from '@angular/core';
import { Store } from '../utils/store/store';
import { Msg, MsgType } from './msg.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MsgService {
  inlines = new Store<Msg[]>([]);
  toasts = new Store<Msg[]>([]);
  private msgId = 1;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.clear();
    });
  }

  add(msg: Msg) {
    // Default stickiness value
    msg.sticky ??= true;
    if (!msg.id) {
      this.msgId++;
      msg.id = `id${this.msgId}`;
    }
    msg.type = msg.type ?? MsgType.TOAST;
    if (msg.type === MsgType.INLINE) {
      this.inlines.add(msg);
    } else {
      this.toasts.add(msg);
    }
  }
  clear() {
    this.inlines.value = [];
    this.toasts.value = [];
  }
}
