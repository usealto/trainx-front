import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { GetQuestionsRequestParams, QuestionDtoApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, filter, map, startWith, switchMap, take, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { QuestionDeleteModalComponent } from 'src/app/modules/shared/components/question-delete-modal/question-delete-modal.component';
import { QuestionFormComponent } from 'src/app/modules/programs/components/create-questions/question-form.component';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { PlaceholderDataStatus } from 'src/app/modules/shared/models/placeholder.model';
import { ScoreFilter } from 'src/app/modules/shared/models/score.model';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { Program } from '../../../../../models/program.model';
import { SelectOption } from '../../../../shared/models/select-option.model';
import { QuestionDisplay, QuestionFilters } from '../../../models/question.model';
import { ProgramsStore } from '../../../programs.store';
import { QuestionsRestService } from '../../../services/questions-rest.service';

@Component({
  selector: 'alto-programs-questions',
  templateUrl: './programs-questions.component.html',
  styleUrls: ['./programs-questions.component.scss'],
})
export class ProgramsQuestionsComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  @Input() programs: Program[] = [];
  //
  questions: QuestionDisplay[] = [];
  paginatedQuestions: QuestionDisplay[] = [];
  questionsCount = 0;
  questionsPageSize = 10;
  questionsScore = new Map<string, number>();
  questionFilters: QuestionFilters = { programs: [], tags: [], search: '' };
  contributors: { id: string; fullname: string }[] = [];
  selectedItems: QuestionDtoApi[] = [];
  questionListStatus: PlaceholderDataStatus = 'loading';

  questionsPageControl = new FormControl(1, { nonNullable: true });
  selectedProgramsControl: FormControl<FormControl<SelectOption>[]> = new FormControl([], {
    nonNullable: true,
  });
  selectedTagsControl: FormControl<FormControl<SelectOption>[]> = new FormControl([], {
    nonNullable: true,
  });
  selectedScoreControl: FormControl<SelectOption | null> = new FormControl(null);
  searchControl: FormControl<string | null> = new FormControl(null);

  private readonly programsQuestionsComponentSubscription = new Subscription();

  constructor(
    private readonly questionsRestService: QuestionsRestService,
    private readonly offcanvasService: NgbOffcanvas,
    public readonly programsStore: ProgramsStore,
    private modalService: NgbModal,
    private readonly scoreService: ScoresService,
  ) {}

  ngOnInit(): void {
    this.programsQuestionsComponentSubscription.add(
      combineLatest([
        this.questionsPageControl.valueChanges.pipe(startWith(this.questionsPageControl.value)),
        this.selectedProgramsControl.valueChanges.pipe(startWith(this.selectedProgramsControl.value)),
        this.selectedTagsControl.valueChanges.pipe(startWith(this.selectedTagsControl.value)),
        // this.selectedScoreControl.valueChanges.pipe(startWith(this.selectedScoreControl.value)),
      ])
        .pipe(
          switchMap(([page, programsControls, tagsControls]) => {
            const req: GetQuestionsRequestParams = {
              page,
              programIds: programsControls.map((x) => x.value.value).join(','),
              tagIds: tagsControls.map((x) => x.value.value).join(','),
            };
            return this.questionsRestService.getQuestions(req);
          }),
          tap((questions) => {
            this.questions = questions;
            this.questionListStatus = questions.length === 0 ? 'noData' : 'good';
            // this.questionPageChange();
          }),
          switchMap(() => {
            return this.selectedScoreControl.valueChanges.pipe(startWith(this.selectedScoreControl.value));
          }),
        )
        .subscribe({
          next: (score) => {
            if (score) {
              this.questions = this.scoreService.filterByScore(
                this.questions,
                score.value as ScoreFilter,
                true,
              );
            }
          },
        }),
    );

    this.programsQuestionsComponentSubscription.add(
      this.questionsPageControl.valueChanges
        .pipe(startWith(this.questionsPageControl.value))
        .subscribe((page) => {
          this.questionPageChange(page);
        }),
    );

    // this.programsQuestionsComponentSubscription.add(
    //   this.programsStore.questionsInitList.value$
    //     .pipe(
    //       filter((x) => !!x),
    //       tap((quests) => {
    //         quests.forEach((q) => this.questionsScore.set(q.id, q.score || 0));
    //         this.getQuestions();
    //       }),
    //       take(1),
    //     )
    //     .subscribe(),
    // );

    // this.programsStore.questionsInitList.value$
    //   .pipe(
    //     filter((x) => !!x),
    //     tap((quests) => {
    //       quests.forEach((q) => this.questionsScore.set(q.id, q.score || 0));
    //       this.getQuestions();
    //     }),
    //     take(1),
    //   )
    //   .subscribe();
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
    // this.questionFilters.programs = programs;
    // this.questionFilters.tags = tags;
    // this.questionFilters.score = score;
    // this.questionFilters.search = search;
    // let obs$;
    // if (this.isFiltersEmpty || this.onlyScoreFilter) {
    //   obs$ = this.programsStore.questionsInitList.value$;
    // } else {
    //   obs$ = this.questionsRestService
    //     .getQuestions({
    //       programIds: programs?.join(','),
    //       tagIds: tags?.join(','),
    //       search,
    //     })
    //     .pipe(
    //       map((questions) => {
    //         const output = questions as QuestionDisplay[];
    //         output.forEach((question) => (question.score = this.getQuestionScore(question.id)));
    //         return output;
    //       }),
    //     );
    // }
    // obs$
    //   .pipe(
    //     tap((questions) => {
    //       // this.questions = questions;
    //       // this.questionListStatus = questions.length === 0 ? 'noData' : 'good';
    //       // if (refreshPagination) {
    //       //   this.questionsPage = 1;
    //       // }
    //       if (score) {
    //         this.questions = this.scoreService.filterByScore(this.questions, score as ScoreFilter, true);
    //       }
    //       // this.questionPageChange();
    //       if (this.questionsCount === 0 && !this.isFiltersEmpty) {
    //         this.questionListStatus = 'noResult';
    //       }
    //     }),
    //     take(1),
    //   )
    //   .subscribe();
  }

  questionPageChange(page: number) {
    this.questionsCount = this.questions.length;

    this.paginatedQuestions = this.questions.slice(
      (page - 1) * this.questionsPageSize,
      page * this.questionsPageSize,
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
        switchMap(() => this.questionsRestService.deleteQuestion(question?.id ?? '')),
        tap(() => {
          modalRef.close();
          this.getQuestions();
        }),
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
  getTagTooltip(question: QuestionDtoApi) {
    return question.tags ? question.tags.map((p) => p.name).join(', ') : '';
  }

  getProgramTooltip(question: QuestionDtoApi) {
    return question.programs ? question.programs.map((p) => p.name).join(', ') : '';
  }
}
