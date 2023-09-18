import { Component, OnInit } from '@angular/core';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';

@Component({
  selector: 'alto-see-question',
  templateUrl: './see-question.component.html',
  styleUrls: ['./see-question.component.scss']
})
export class SeeQuestionComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;

  ngOnInit(): void {
    return;
  }
}
