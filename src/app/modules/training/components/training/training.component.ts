import { Component, OnInit } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import {
  GetNextQuestionsForUserRequestParams,
  GuessSourceEnumApi,
  QuestionApi,
} from '@usealto/sdk-ts-angular';
import { Subscription, tap, timer } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { GuessesRestService } from '../../services/guesses-rest.service';
import { ExplanationComponent } from '../explanation/explanation.component';

interface AnswerCard {
  answer: string;
  selected: boolean;
  type: '' | 'selected' | 'correct' | 'wrong';
}

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'alto-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss'],
})
export class TrainingComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  displayTime = 30;
  time = 31000;
  timer?: Subscription;

  isContinuous = true;
  // TODO : Use when we do the program based question
  // questionsCount = 0;
  // questionsPage = 0;
  // questionsPageSize = 25;
  remainingQuestions: QuestionApi[] = [];

  displayedQuestion!: QuestionApi;
  isQuestionsLoading = true;
  currentAnswers: AnswerCard[] = [];
  isTimedOut = false;

  constructor(
    private readonly offCanvasService: NgbOffcanvas,
    private readonly usersRestService: UsersRestService,
    private readonly guessRestService: GuessesRestService,
    private readonly profileStore: ProfileStore,
  ) {}

  ngOnInit(): void {
    this.getNextQuestion();
  }

  getQuestions(page?: number) {
    this.isQuestionsLoading = true;

    // * CONTINUOUS TRAINNG
    if (this.isContinuous) {
      this.usersRestService
        .getNextQuestionsPaginated(this.profileStore.user.value.id, {
          page: 1,
          itemsPerPage: 1,
        } as GetNextQuestionsForUserRequestParams)
        .pipe(
          tap(({ data }) => {
            if (data) {
              this.setDisplayedQuestion(data[0]);
            }
            // TODO : Use when we do the program based question
            // this.remainingQuestions = res.data ?? [];
            // this.questionsCount = res.meta.totalItems ?? 0;
            // if (this.remainingQuestions.length > 0) {
            //   this.getNextQuestion();
            // }
          }),
          untilDestroyed(this),
        )
        .subscribe();
    }
  }

  selectAnswer(answer: string) {
    if (this.displayedQuestion.answersAccepted.length < 2) {
      this.currentAnswers.forEach((a) => {
        a.selected = false;
        a.type = '';
      });
    }
    const card = this.currentAnswers.find((a) => a.answer === answer);
    if (card) {
      card.selected = !card.selected;
      card.type = card.selected === true ? 'selected' : '';
    }
  }

  submitAnswer() {
    this.stopTimer();
    let result = 'wrong';
    let countGoodAnswers = 0;

    this.currentAnswers.map((a) => {
      if (this.displayedQuestion.answersAccepted.includes(a.answer)) {
        a.type = 'correct';
      } else {
        if (a.selected && !this.displayedQuestion.answersAccepted.includes(a.answer)) a.type = 'wrong';
      }
      if (a.selected && a.type === 'correct') {
        countGoodAnswers++;
      }
      if (countGoodAnswers === this.displayedQuestion.answersAccepted.length) {
        result = 'correct';
      }
    });
    this.openCanvas(result);
  }

  openCanvas(result: string) {
    const canvasRef = this.offCanvasService.open(ExplanationComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
      backdrop: 'static',
    });
    canvasRef.componentInstance.explanation = this.displayedQuestion.explanation;
    canvasRef.componentInstance.result = result;
    canvasRef.componentInstance.correctAnswers = this.displayedQuestion.answersAccepted;
    canvasRef.componentInstance.link = this.displayedQuestion.link;
    canvasRef.componentInstance.nextQuestion
      .pipe(
        tap(() => {
          canvasRef.dismiss();
          this.saveAnswer();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  saveAnswer() {
    const selectedAnswers = this.currentAnswers.filter((a) => a.selected).map((a) => a.answer);
    this.guessRestService
      .postGuess({
        questionId: this.displayedQuestion.id,
        answers: selectedAnswers.length > 0 ? selectedAnswers : undefined,
        source: GuessSourceEnumApi.Web,
        isTimedOut: this.isTimedOut,
        isUnknownSelected: selectedAnswers.length === 0,
      })
      .pipe(
        tap(() => {
          this.getNextQuestion();
        }),
      )
      .subscribe();
  }

  getNextQuestion() {
    if (this.isContinuous) {
      this.getQuestions();
    } else {
      if (this.remainingQuestions.length === 0) {
        // this.questionsPage++;
        this.getQuestions();
      } else {
        this.setDisplayedQuestion(this.remainingQuestions.pop() as QuestionApi);
      }
    }
  }

  setDisplayedQuestion(quest: QuestionApi) {
    this.displayedQuestion = quest;
    this.getCurrentAnswers(this.displayedQuestion.answersAccepted, this.displayedQuestion.answersWrong);
    this.isTimedOut = false;
    this.countDown(this.time);
  }

  countDown(time: number) {
    const date = new Date();

    this.timer = timer(0, 150)
      .pipe(
        tap(() => {
          const dateNow = new Date();
          const diff = dateNow.getTime() - date.getTime();
          this.displayTime = Math.floor((time - diff) / 1000);
          if (this.displayTime <= 0) {
            this.stopTimer();
            this.isTimedOut = true;
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  stopTimer() {
    if (this.timer) {
      this.timer.unsubscribe();
    }
  }

  getCurrentAnswers(correct: string[], wrong: string[]) {
    this.currentAnswers = [];
    const array = this.shuffleArray([...correct, ...wrong]);
    array.forEach((answer) => {
      this.currentAnswers.push({ answer: answer, selected: false, type: '' });
    });
    this.isQuestionsLoading = false;
  }

  shuffleArray(array: string[]): string[] {
    const shuffledArray = [...array];

    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[randomIndex]] = [shuffledArray[randomIndex], shuffledArray[i]];
    }

    return shuffledArray;
  }
}
