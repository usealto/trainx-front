import { Component, OnInit } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { GetNextQuestionsForUserRequestParams, QuestionApi } from '@usealto/sdk-ts-angular';
import { map, tap, timer } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ExplanationComponent } from '../explanation/explanation.component';

interface AnswerCard {
  answer: string;
  selected: boolean;
  type: '' | 'selected' | 'correct' | 'wrong';
}
@Component({
  selector: 'alto-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss'],
})
export class TrainingComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  displayTime = 30;
  time = 30000;
  timer: any;

  remainingQuestions: QuestionApi[] = [];
  questionsCount = 0;
  questionsPage = 1;
  questionsPageSize = 25;
  displayedQuestion!: QuestionApi;
  isQuestionsLoading = true;

  currentAnswers: AnswerCard[] = [];

  constructor(
    private readonly offCanvasService: NgbOffcanvas,
    private readonly usersRestService: UsersRestService,
    private readonly profileStore: ProfileStore,
  ) {}

  ngOnInit(): void {
    this.getNextQuestion();
  }

  getQuestions(page: number) {
    this.isQuestionsLoading = true;
    this.usersRestService
      .getNextQuestionsPaginated(this.profileStore.user.value.id, {
        page: page,
      } as GetNextQuestionsForUserRequestParams)
      .pipe(
        tap((res) => {
          this.remainingQuestions = res.data ?? [];
          this.questionsCount = res.meta.totalItems ?? 0;
          this.getNextQuestion();
        }),
      )
      .subscribe();
  }

  selectAnswer(answer: string) {
    this.currentAnswers.forEach((a) => {
      a.selected = false;
      a.type = '';
    });
    const card = this.currentAnswers.find((a) => a.answer === answer);
    if (card) {
      card.selected = !card.selected;
      card.type = card.selected === true ? 'selected' : '';
    }
  }

  submitAnswer() {
    this.stopTimer();
    let result = '';
    this.currentAnswers.forEach((a) => {
      if (this.displayedQuestion.answersAccepted.includes(a.answer)) {
        if (a.selected === true) {
          result = 'correct';
        }
        a.type = 'correct';
      }
      if (!this.displayedQuestion.answersAccepted.includes(a.answer) && a.selected === true) {
        result = 'wrong';
        a.type = 'wrong';
      }
    });
    this.openCanvas(result);
  }

  openCanvas(result: string) {
    const canvasRef = this.offCanvasService.open(ExplanationComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
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
      )
      .subscribe();
  }

  saveAnswer() {
    this.getNextQuestion();
  }

  getNextQuestion() {
    if (this.remainingQuestions.length === 0) {
      this.questionsPage++;
      this.getQuestions(this.questionsPage);
    } else {
      this.displayedQuestion = this.remainingQuestions.pop() as QuestionApi;
      this.getCurrentAnswers(this.displayedQuestion.answersAccepted, this.displayedQuestion.answersWrong);
    }
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
            this.submitAnswer();
          }
        }),
      )
      .subscribe();
  }

  stopTimer() {
    this.timer.unsubscribe();
    this.timer.remove();
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
