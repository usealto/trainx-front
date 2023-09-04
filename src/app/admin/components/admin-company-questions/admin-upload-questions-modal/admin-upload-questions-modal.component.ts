import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  CreateQuestionDtoApi,
  IdDtoApi,
  ProgramDtoApi,
  TagDtoApi,
  UserDtoApi,
} from '@usealto/sdk-ts-angular';
import * as Papa from 'papaparse';
import { Observable, Subject, combineLatest, tap } from 'rxjs';
import { ProgramsRestService } from 'src/app/modules/programs/services/programs-rest.service';
import { QuestionsRestService } from 'src/app/modules/programs/services/questions-rest.service';
import { TagsRestService } from 'src/app/modules/programs/services/tags-rest.service';
import { DropzoneChangeEvent } from 'src/app/modules/shared/components/dropzone/dropzone.component';

interface rawQuestion {
  question: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  answer5: string;
  answer6: string;
  answer7: string;
  answer8: string;
  answer9: string;
  answer10: string;
  correctAnswers: string;
  info: string;
  tags: string;
  programs: string;
  link: string;
}

@Component({
  selector: 'alto-admin-upload-questions-modal',
  templateUrl: './admin-upload-questions-modal.component.html',
  styleUrls: ['./admin-upload-questions-modal.component.scss'],
})
export class AdminUploadQuestionsModalComponent implements OnInit {
  csvData: any[] = [];
  questions: CreateQuestionDtoApi[] = [];
  displayedQuestions: CreateQuestionDtoApi[] = [];
  questionsPage = 1;
  user: UserDtoApi = {} as UserDtoApi;
  tags: TagDtoApi[] = [];
  programs: ProgramDtoApi[] = [];

  errorLogs: { title: string; error: string }[] = [];
  errorLogsPage = 1;
  displayedErrorLogs: { title: string; error: string }[] = [];

  constructor(
    public modal: NgbActiveModal,
    private readonly tagsRestService: TagsRestService,
    private readonly programsRestService: ProgramsRestService,
    private readonly questionRestService: QuestionsRestService,
  ) {}

  ngOnInit(): void {
    combineLatest({
      tags: this.tagsRestService.getTags(),
      programs: this.programsRestService.getPrograms(),
    })
      .pipe(
        tap(({ tags, programs }) => {
          this.tags = tags;
          this.programs = programs;
        }),
      )
      .subscribe();
  }

  onDropzoneEvent(event: DropzoneChangeEvent) {
    if (event.addedFiles.length > 0) {
      this.parseFile(event.addedFiles[0])
        .pipe(
          tap((csvData) => {
            this.errorLogs = [];
            this.formatData(csvData);
            this.changeQuestionsPage(1);
            this.changeErrorLogsPage(1);
          }),
        )
        .subscribe();
    }
  }

  translateLetterToIndex(letter: string): number {
    const alphabet = 'ABCDEFGHIJ';
    return alphabet.indexOf(letter.toUpperCase());
  }

  formatData(data: rawQuestion[]) {
    let res = data.map((rawQuestion) => {
      const tagsIds: IdDtoApi[] = rawQuestion.tags.split(',').reduce((result, tagName) => {
        const tag = this.tags.find((tag) => tag.name === tagName);
        if (tag?.id) {
          result.push({ id: tag.id });
        } else {
          this.addToErrorLogs(rawQuestion.question, 'tag not in company database');
        }
        return result;
      }, [] as IdDtoApi[]);
      const programIds: IdDtoApi[] = rawQuestion.programs.split(',').reduce((result, programName) => {
        const program = this.programs.find((program) => program.name === programName);
        if (program?.id) {
          result.push({ id: program.id });
        } else if (rawQuestion.programs !== '') {
          this.addToErrorLogs(rawQuestion.question, 'program not in company database');
        }
        return result;
      }, [] as IdDtoApi[]);

      const correctAnswerIndexs = rawQuestion.correctAnswers
        .split('')
        .map((letter) => this.translateLetterToIndex(letter));

      const answers: { answer: string; isCorrect: boolean }[] = [
        rawQuestion.answer1,
        rawQuestion.answer2,
        rawQuestion.answer3,
        rawQuestion.answer4,
        rawQuestion.answer5,
        rawQuestion.answer6,
        rawQuestion.answer7,
        rawQuestion.answer8,
        rawQuestion.answer9,
        rawQuestion.answer10,
      ].map((answer, index) => {
        return {
          answer: answer,
          isCorrect: correctAnswerIndexs.includes(index),
        };
      });
      correctAnswerIndexs.forEach((correctAnswerIndex) => {
        if (answers[correctAnswerIndex].answer === '') {
          this.addToErrorLogs(rawQuestion.question, 'correct answer missing');
        }
      });
      return {
        type: 'multiple_choice',
        tagIds: tagsIds,
        programIds: programIds,
        answerType: 'text',
        title: rawQuestion.question,
        answersAccepted: answers
          .filter((answer) => answer.isCorrect)
          .map((answer) => answer.answer)
          .filter((question) => question !== '' && question !== ' '),
        answersWrong: answers
          .filter((answer) => !answer.isCorrect)
          .map((answer) => answer.answer)
          .filter((question) => question !== '' && question !== ' '),
        explanation: rawQuestion.info,
        link: rawQuestion.link,
      } as CreateQuestionDtoApi;
    });
    res = res.filter((q) => !this.errorLogs.some((error) => error.title === q.title));

    this.questions = res;
  }

  parseFile(file: File): Observable<rawQuestion[]> {
    let data: any[] = [];
    const obs: Subject<rawQuestion[]> = new Subject();
    Papa.parse(file, {
      complete: (results: { data: any[] }) => {
        results.data.forEach((questionRow: string[]) => {
          const question = {
            question: questionRow[0],
            answer1: questionRow[1],
            answer2: questionRow[2],
            answer3: questionRow[3],
            answer4: questionRow[4],
            answer5: questionRow[5],
            answer6: questionRow[6],
            answer7: questionRow[7],
            answer8: questionRow[8],
            answer9: questionRow[9],
            answer10: questionRow[10],
            correctAnswers: questionRow[11],
            info: questionRow[12],
            tags: questionRow[13],
            programs: questionRow[14],
            link: questionRow[15],
          };
          data.push(question);
        });
        if (data[data.length - 1].question === '') {
          data.pop();
        }
        data = data.slice(1);
        this.errorHandler(data);
        obs.next(data);
      },
    });
    return obs.asObservable();
  }

  errorHandler(data: rawQuestion[]) {
    data.forEach((question) => {
      if (question.question === '') {
        this.addToErrorLogs(question.question, 'question title missing');
      } else if (question.answer1 === '' || question.answer2 === '') {
        this.addToErrorLogs(question.question, 'minimum answers missing');
      } else if (question.correctAnswers === '') {
        this.addToErrorLogs(question.question, 'correct answer missing');
      } else if (question.tags === '') {
        this.addToErrorLogs(question.question, 'tags missing');
      }
    });
  }

  uploadQuestions() {
    const obs: Observable<any>[] = this.questions.map((question) =>
      this.questionRestService.createQuestion(question),
    );
    combineLatest(obs)
      .pipe(
        tap((res) => {
          if (res.length === this.questions.length) {
            this.modal.close(this.questions.length);
          } else {
            this.modal.close(-1);
          }
        }),
      )
      .subscribe();
  }

  deleteQuestion(question: CreateQuestionDtoApi) {
    this.questions = this.questions.filter((q) => q.title !== question.title);
  }

  changeQuestionsPage(page: number) {
    this.questionsPage = page;
    this.displayedQuestions = this.questions.slice((page - 1) * 10, page * 10);
  }

  addToErrorLogs(question: string, error: string) {
    const questionIndex = this.errorLogs.findIndex((q) => q.title === question);
    if (questionIndex === -1) {
      this.errorLogs.push({ title: question, error: error });
    } else {
      this.errorLogs[questionIndex].error += ', ' + error;
    }
    return;
  }

  changeErrorLogsPage(page: number) {
    this.errorLogsPage = page;
    this.displayedErrorLogs = this.errorLogs.slice((page - 1) * 10, page * 10);
  }
}
