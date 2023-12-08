import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  GetNextQuestionsForUserRequestParams,
  GuessSourceEnumApi,
  NextQuestionDtoApi,
  ProgramDtoApi,
  ProgramRunDtoApi,
  QuestionApi,
  QuestionDtoApi,
} from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, filter, map, of, switchMap, tap, timer } from 'rxjs';
import { EResolverData, ResolversService } from 'src/app/core/resolvers/resolvers.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { User } from 'src/app/models/user.model';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { QuestionSubmittedFormComponent } from 'src/app/modules/programs/components/questions/question-submitted-form/question-submitted-form.component';
import { ProgramRunsRestService } from 'src/app/modules/programs/services/program-runs-rest.service';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { QuestionsSubmittedRestService } from 'src/app/modules/programs/services/questions-submitted-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { IAppData } from '../../../../core/resolvers';
import { GuessesRestService } from '../../services/guesses-rest.service';
import { ExplanationComponent } from '../explanation/explanation.component';

interface AnswerCard {
  answer: string;
  selected: boolean;
  type: '' | 'selected' | 'correct' | 'wrong';
}

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

  user!: User;

  isContinuous = true;

  questionsCount = 0;
  questionsAnswered = 0;
  questionNumber = 0;
  questionsGoodAnswers = 0;

  programId = '';
  program?: ProgramDtoApi;
  programRun?: ProgramRunDtoApi;
  score = 0;

  remainingQuestions: QuestionDtoApi[] = [];

  displayedQuestion!: QuestionApi | QuestionDtoApi | NextQuestionDtoApi;
  isQuestionsLoading = true;
  currentAnswers: AnswerCard[] = [];
  iDontKnow = false;
  isTimedOut = false;

  @ViewChild('modalContent') modalContent!: ElementRef;

  constructor(
    private readonly offCanvasService: NgbOffcanvas,
    private readonly usersRestService: UsersRestService,
    private readonly guessRestService: GuessesRestService,
    private readonly programsRestService: ProgramsRestService,
    private readonly programRunsRestService: ProgramRunsRestService,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly offcanvasService: NgbOffcanvas,
    private modalService: NgbModal,
    private readonly resolversService: ResolversService,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.route.pathFromRoot);
    this.user = (data[EResolverData.AppData] as IAppData).me;
    this.route.params
      .pipe(
        map((p) => {
          if (p['programId']) {
            this.isContinuous = false;
            this.programId = p['programId'];
          } else {
            this.getNextQuestion();
          }
        }),
        filter(() => !this.isContinuous),
        switchMap(() =>
          this.programRunsRestService.getProgramRunsPaginated({
            programIds: this.programId,
            createdBy: this.user.id,
          }),
        ),
        switchMap(({ data }) => {
          if (data && data?.length > 0 && !data[0].finishedAt) {
            return of(data[0]);
          } else {
            return this.programRunsRestService.create({ programId: this.programId }).pipe(map((a) => a.data));
          }
        }),
        tap((pr) => {
          this.programRun = pr;
          this.questionsGoodAnswers = pr?.goodGuessesCount ?? 0;
        }),
        switchMap(() => this.programsRestService.getPrograms()),
        tap((progs) => {
          this.program = progs.find((p) => p.id === this.programId);
          if (this.programRun) {
            this.questionsCount = this.programRun.questionsCount;
          } else {
            throw 'Program Not Found';
          }
        }),
        switchMap(() =>
          combineLatest([
            this.programRunsRestService.getMyProgramRunsQuestions({ id: this.programRun?.id ?? '' }),
            this.guessRestService.getGuesses({
              createdBy: this.user.id,
              programRunIds: this.programRun?.id,
            }),
          ]),
        ),
        tap(([questions, guesses]) => {
          this.questionsAnswered = guesses.meta.totalItems;
          this.questionNumber = this.questionsAnswered;
          this.remainingQuestions =
            questions.data?.filter((q) => guesses.data?.every((g) => g.questionId !== q.id)) ?? [];
          this.getNextQuestion();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  uncheck(checked: boolean) {
    this.iDontKnow = checked;
    this.currentAnswers.forEach((a) => {
      a.selected = false;
      a.type = '';
    });
  }

  selectAnswer(answer: string) {
    this.iDontKnow = false;
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
    let countBadAnswers = 0;

    this.currentAnswers.map((a) => {
      if (this.displayedQuestion.answersAccepted.includes(a.answer)) {
        a.type = 'correct';
      } else if (a.selected && !this.displayedQuestion.answersAccepted.includes(a.answer)) {
        a.type = 'wrong';
      }
      if (a.selected && a.type === 'correct') {
        countGoodAnswers++;
      } else if (a.selected && a.type === 'wrong') {
        countBadAnswers++;
      }
    });

    if (countGoodAnswers === this.displayedQuestion.answersAccepted.length && countBadAnswers === 0) {
      result = 'correct';
      this.questionsGoodAnswers++;
    } else if (this.iDontKnow || (countBadAnswers === 0 && countGoodAnswers === 0)) {
      this.iDontKnow = true;
      result = 'noanswer';
    } else {
      result = 'wrong';
    }

    this.openExplanation(result);
  }

  openExplanation(result: string) {
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
        isUnknownSelected: this.iDontKnow,
      })
      .pipe(
        tap(() => {
          this.questionsAnswered++;
          this.iDontKnow = false;
          this.getNextQuestion();
        }),
      )
      .subscribe();
  }

  getNextQuestion() {
    if (this.isContinuous) {
      this.isQuestionsLoading = true;

      this.usersRestService
        .getNextQuestionsPaginated(this.user.id, {
          page: 1,
          itemsPerPage: 1,
        } as GetNextQuestionsForUserRequestParams)
        .pipe(
          tap(({ data }) => {
            if (data) {
              this.setDisplayedQuestion(data[0]);
            }
          }),
          untilDestroyed(this),
        )
        .subscribe();
    } else {
      if (this.remainingQuestions?.length === 0) {
        setTimeout(() => {
          // ? SetTimeout is beacause of an animation problem from the Offcanvas (I think)
          this.openDoneModal();
        }, 1000);
      } else {
        this.questionNumber++;
        const last = this.remainingQuestions?.pop();
        if (last) {
          this.setDisplayedQuestion(last);
        }
      }
    }
  }

  setDisplayedQuestion(quest: QuestionApi | QuestionDtoApi | NextQuestionDtoApi) {
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

  openDoneModal() {
    this.score = this.questionsGoodAnswers ? this.questionsGoodAnswers / this.questionsCount : 0;
    this.modalService.open(this.modalContent, {
      backdrop: 'static',
      size: 'sm',
      centered: true,
      animation: false,
    });
  }

  closeModal() {
    this.modalService.dismissAll();
    this.router.navigate(['/', AltoRoutes.user, AltoRoutes.training]);
  }

  openQuestionForm() {
    const canvasRef = this.offcanvasService.open(QuestionSubmittedFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
      backdrop: 'static',
    });
    canvasRef.componentInstance.programName = this.program?.name;
    canvasRef.componentInstance.createdQuestion
      .pipe(
        switchMap((title: string) => this.questionsSubmittedRestService.create(title)),
        tap(() => {
          this.router.navigate(['/', AltoRoutes.user, AltoRoutes.training]);
        }),
      )
      .subscribe();

    canvasRef.dismissed
      .pipe(tap(() => this.router.navigate(['/', AltoRoutes.user, AltoRoutes.training])))
      .subscribe();

    this.modalService.dismissAll();
  }
}
