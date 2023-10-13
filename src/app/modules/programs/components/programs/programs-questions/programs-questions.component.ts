import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { QuestionDtoApi } from '@usealto/sdk-ts-angular';
import { map, switchMap, tap, take } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { QuestionDeleteModalComponent } from 'src/app/modules/shared/components/question-delete-modal/question-delete-modal.component';
import { QuestionFormComponent } from 'src/app/modules/shared/components/question-form/question-form.component';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreFilter } from 'src/app/modules/shared/models/score.model';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { QuestionDisplay, QuestionFilters } from '../../../models/question.model';
import { ProgramsStore } from '../../../programs.store';
import { QuestionsRestService } from '../../../services/questions-rest.service';

@UntilDestroy()
@Component({
  selector: 'alto-programs-questions',
  templateUrl: './programs-questions.component.html',
  styleUrls: ['./programs-questions.component.scss'],
})
export class ProgramsQuestionsComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  //
  questions: QuestionDisplay[] = [];
  paginatedQuestions: QuestionDisplay[] = [];
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
    private readonly offcanvasService: NgbOffcanvas,
    public readonly teamStore: TeamStore,
    public readonly programsStore: ProgramsStore,
    private modalService: NgbModal,
    private readonly scoreService: ScoresService,
  ) {}

  ngOnInit(): void {
    this.programsStore.questionsInitList.value$
      .pipe(
        tap((quests) => {
          quests.forEach((q) => this.questionsScore.set(q.id, q.score || 0));
          this.getQuestions();
        }),
        take(1),
      )
      .subscribe();
  }

  getQuestions(
    {
      programs = this.questionFilters.programs,
      tags = this.questionFilters.tags,
      score = this.questionFilters.score,
      search = this.questionFilters.search,
    }: QuestionFilters = this.questionFilters,
    refreshPagination = false,
  ) {
    this.questionFilters.programs = programs;
    this.questionFilters.tags = tags;
    this.questionFilters.score = score;

    this.questionFilters.search = search;

    let obs$;

    if (this.isFiltersEmpty || this.onlyScoreFilter) {
      obs$ = this.programsStore.questionsInitList.value$;
    } else {
      obs$ = this.questionsService
        .getQuestions({
          programIds: programs?.join(','),
          tagIds: tags?.join(','),
          search,
        })
        .pipe(
          map((questions) => {
            const output = questions as QuestionDisplay[];
            output.forEach((question) => (question.score = this.getQuestionScore(question.id)));
            return output;
          }),
        );
    }

    obs$
      .pipe(
        tap((questions) => {
          this.questions = questions;
          this.questionListStatus = questions.length === 0 ? 'noData' : 'good';

          if (refreshPagination) {
            this.questionsPage = 1;
          }

          if (score) {
            this.questions = this.scoreService.filterByScore(this.questions, score as ScoreFilter, true);
          }

          this.questionPageChange();

          if (this.questionsCount === 0 && !this.isFiltersEmpty) {
            this.questionListStatus = 'noResult';
          }
        }),
        take(1),
      )
      .subscribe();
  }

  questionPageChange() {
    this.questionsCount = this.questions.length;

    this.paginatedQuestions = this.questions.slice(
      (this.questionsPage - 1) * this.questionsPageSize,
      this.questionsPage * this.questionsPageSize,
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
        untilDestroyed(this),
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
    this.getQuestions();
    this.selectedItems = [];
  }

  get isFiltersEmpty(): boolean {
    return Object.values(this.questionFilters).filter((x) => !!x && x.length > 0).length === 0;
  }

  get onlyScoreFilter(): boolean {
    return (
      Object.values(this.questionFilters).filter((x) => !!x && x.length > 0).length === 1 &&
      !!this.questionFilters.score
    );
  }
}
