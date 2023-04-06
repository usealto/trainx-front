import { Component } from '@angular/core';
import { Msg, MsgType } from '../msg.model';
import { MsgService } from '../msg.service';

@Component({
  selector: 'alto-msg',
  templateUrl: './msg.component.html',
  styleUrls: ['./msg.component.scss'],
})
export class MsgComponent {
  MsgType = MsgType;
  toastTop = 0;
  disappearDelay = 5000;

  constructor(public msg: MsgService) {}

  getClass(item: Msg): string {
    const output = ['p-3'];
    if (item.type === MsgType.INLINE) {
      output.push('inline');
    } else {
      output.push('toast');
    }

    if (item.severity) {
      output.push(item.severity);
    }

    if (!item.sticky) {
      setTimeout(() => {
        this.remove(item.id);
      }, this.disappearDelay);
    }

    return output.join(' ');
  }

  remove(id: string) {
    if (document.getElementById(id)) {
      document.getElementById(id)?.classList.add('byebye');
    }

    setTimeout(() => {
      this.msg.inlines.value = this.msg.inlines.value.filter((x) => x.id !== id);
      this.msg.toasts.value = this.msg.toasts.value.filter((x) => x.id !== id);
    }, 500);
  }
}
