import { ResolveFn } from '@angular/router';
import { EmojiMap, emojiData } from '../utils/emoji/data';

export const appResolver: ResolveFn<void> = () => {
  emojiData.forEach((emoji) => {
    EmojiMap.set(emoji.id, emoji);
  });
};
