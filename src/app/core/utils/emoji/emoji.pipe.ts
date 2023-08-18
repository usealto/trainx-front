import { Pipe, PipeTransform } from '@angular/core';
import { EmojiMap, EmojiName, emojiBaseUrl } from './data';

@Pipe({
  name: 'emoji',
  standalone: true,
})
export class EmojiPipe implements PipeTransform {
  transform(value: EmojiName): string {
    return EmojiMap.has(value) ? emojiBaseUrl + EmojiMap.get(value)?.img ?? '' : '';
  }
}
