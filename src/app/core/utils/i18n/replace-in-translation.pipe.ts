import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceInTranslation',
})
export class ReplaceInTranslationPipe implements PipeTransform {
  /**
   * Translation file
   * ```js
   * { trees: 'I have {{}} trees and {{}} apples'}
   * ```
   *
   * Template
   * ```html
   * {{ Trads.trees | replaceInTranslation: '10':'0' }}
   * <!-- I have 10 trees and 0 apples -->
   * ```
   */
  transform(translation: string, ...args: (string | number | undefined)[]): string {
    let output = translation;
    args.forEach((chunck) => {
      output = output.replace('{{}}', chunck as string);
    });
    return output;
  }
}
