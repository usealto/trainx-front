import { Component, OnInit } from '@angular/core';
import { allLangs, defaultLang, I18ns } from '../I18n';

@Component({
  selector: 'alto-i18n-editor',
  templateUrl: './i18n-editor.component.html',
  styleUrls: ['./i18n-editor.component.scss'],
})
export class I18nEditorComponent implements OnInit {
  data?: { [key: string]: string[] };

  ngOnInit(): void {
    console.log(JSON.stringify(I18ns)); // Use this JSON with a translation editor

    const defLangFlat: any = this.flattenObject(defaultLang);
    allLangs.slice(1).forEach((x) => {
      const flat = this.flattenObject(x);
      Object.keys(defLangFlat).forEach((x) => {
        defLangFlat[x].push(x in flat ? flat[x][0] : '');
      });
    });
    this.data = defLangFlat;
  }

  flattenObject(ob: any) {
    const toReturn: any = {};

    for (const i in ob) {
      if (typeof ob[i] === 'object' && ob[i] !== null) {
        const flatObject = this.flattenObject(ob[i]);
        for (const x in flatObject) {
          toReturn[i + '.' + x] = flatObject[x];
        }
      } else {
        toReturn[i] = [ob[i]];
      }
    }
    return toReturn;
  }
}
