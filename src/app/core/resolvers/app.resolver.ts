import { Resolve } from '@angular/router';

import { EmojiMap, emojiData } from '../utils/emoji/data';
import { Injectable } from '@angular/core';

@Injectable()
export class AppResolver implements Resolve<void> {
  constructor() {}

  resolve(): void {
    emojiData.forEach((emoji) => {
      EmojiMap.set(emoji.id, emoji);
    });
  }
}
