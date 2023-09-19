import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionSubmittedDtoApi } from '@usealto/sdk-ts-angular';
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';

@Component({
  selector: 'alto-see-question',
  templateUrl: './see-question.component.html',
  styleUrls: ['./see-question.component.scss'],
})
export class SeeQuestionComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;
  submittedQuestion!: QuestionSubmittedDtoApi;
  isLoading = true;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly questionsSubmittedTestService: QuestionsSubmittedRestService,
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        map((p) => {
          return p['id'];
        }),
        switchMap((id) => this.questionsSubmittedTestService.getQuestion(id)),
        tap((r) => {
          if (r) {
            console.log(r);
            console.log(this.route.firstChild);
            // this.submittedQuestion = r;
            this.isLoading = false;
          }
        }),
      )
      .subscribe();
  }
}
