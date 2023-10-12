import { Component } from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { QuestionDtoApi, QuestionStatsDtoApi } from '@usealto/sdk-ts-angular';
import { Observable, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { QuestionDeleteModalComponent } from 'src/app/modules/shared/components/question-delete-modal/question-delete-modal.component';
import { QuestionFormComponent } from 'src/app/modules/shared/components/question-form/question-form.component';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreDuration, ScoreFilter } from 'src/app/modules/shared/models/score.model';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { QuestionFilters } from '../../../models/question.model';
import { ProgramsStore } from '../../../programs.store';
import { QuestionsRestService } from '../../../services/questions-rest.service';

interface QuestionDisplay extends QuestionDtoApi {
  score?: number;
}

@UntilDestroy()
@Component({
  selector: 'alto-programs-questions',
  templateUrl: './programs-questions.component.html',
  styleUrls: ['./programs-questions.component.scss'],
})
export class ProgramsQuestionsComponent {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  //
  questions: QuestionDisplay[] = [];
  paginatedQuestions!: QuestionDisplay[];
  questionsPage = 1;
  questionsCount = 0;
  questionsPageSize = 10;
  questionsScore = new Map<string, number>();
  questionFilters: QuestionFilters = { programs: [], tags: [], search: '' };
  contributors: { id: string; fullname: string }[] = [];
  selectedItems: QuestionDtoApi[] = [];
  questionListStatus: PlaceholderDataStatus = 'loading';

  constructor(
    private readonly questionsService: QuestionsRestService,
    private readonly scoresRestServices: ScoresRestService,
    private readonly offcanvasService: NgbOffcanvas,
    public readonly teamStore: TeamStore,
    public readonly programsStore: ProgramsStore,
    private modalService: NgbModal,
    private readonly scoreService: ScoresService,
  ) {}

  getQuestions(
    {
      programs = this.questionFilters.programs,
      tags = this.questionFilters.tags,
      // score = this.questionFilters.score,
      search = this.questionFilters.search,
    }: QuestionFilters = this.questionFilters,
    refreshPagination = false,
  ) {
    this.questionFilters.programs = programs;
    this.questionFilters.tags = tags;
    // this.questionFilters.score = score;

    this.questionFilters.search = search;

    this.questionsService
      .getQuestions({
        programIds: programs?.join(','),
        tagIds: tags?.join(','),
        search,
      })
      .pipe(
        tap((questions) => {
          const output = questions as QuestionDisplay[];
          output.forEach((question) => (question.score = this.getQuestionScore(question.id)));

          this.questions = output;
          this.questionListStatus = output.length === 0 ? 'noData' : 'good';

          if (refreshPagination) {
            this.questionsPage = 1;
          }

          // this.paginatedQuestions = questions.slice(
          //   (this.questionsPage - 1) * this.questionsPageSize,
          //   this.questionsPage * this.questionsPageSize,
          // );
          if (this.questionFilters.score) {
            this.filterQuestionsByScore(this.questionFilters.score);
          } else {
            this.questionPageChange();
          }
          this.questionsCount = questions.length;

          console.log(this.questionFilters);
          if (
            this.questionsCount === 0 &&
            Object.values(this.questionFilters).filter((x) => !!x).length !== 0
          ) {
            this.questionListStatus = 'noResult';
          }
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  questionPageChange() {
    this.paginatedQuestions = this.questions.slice(
      (this.questionsPage - 1) * this.questionsPageSize,
      this.questionsPage * this.questionsPageSize,
    );
  }

  filterQuestionsByScore(score: string) {
    this.questionsPage = 1;
    this.questionFilters.score = score;

    if (score) {
      this.questions = this.scoreService.filterByScore(this.questions, score as ScoreFilter, true);
    }
    this.questionPageChange();
  }

  getScoresfromQuestions(): Observable<QuestionStatsDtoApi[]> {
    return this.scoresRestServices.getQuestionsStats(ScoreDuration.All, false).pipe(
      tap((stats) => {
        stats.forEach((stat) => {
          this.questionsScore.set(stat.question.id, stat.score || 0);
        });
      }),
    );
  }

  openQuestionForm(question?: QuestionDtoApi) {
    const canvasRef = this.offcanvasService.open(QuestionFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });
    canvasRef.componentInstance.question = question;
    canvasRef.componentInstance.createdQuestion
      .pipe(
        tap(() => {
          this.getQuestions();
        }),
      )
      .subscribe();
  }

  deleteQuestion(question?: QuestionDtoApi) {
    const modalRef = this.modalService.open(QuestionDeleteModalComponent, { centered: true, size: 'md' });
    const componentInstance = modalRef.componentInstance as QuestionDeleteModalComponent;
    componentInstance.question = question;
    componentInstance.questionDeleted
      .pipe(
        switchMap(() => this.questionsService.deleteQuestion(question?.id ?? '')),
        tap(() => {
          modalRef.close();
          this.getQuestions();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  @memoize()
  getQuestionScore(id: string): number {
    const output = this.questionsScore.get(id) || 0;
    return isNaN(output) ? 0 : output;
  }

  resetFilters() {
    this.questionFilters = {};
    this.selectedItems = [];
  }
}
