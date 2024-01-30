import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import {
  GetQuestionsStatsRequestParams,
  QuestionDtoApi,
  TagDtoApi,
  TagLightDtoApi,
} from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, debounceTime, startWith, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { QuestionFormComponent } from 'src/app/modules/programs/components/create-questions/question-form.component';
import { QuestionDeleteModalComponent } from 'src/app/modules/shared/components/question-delete-modal/question-delete-modal.component';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ToastService } from '../../../../../core/toast/toast.service';
import { Company } from '../../../../../models/company.model';
import { Program } from '../../../../../models/program.model';
import { EScoreDuration, EScoreFilter, Score } from '../../../../../models/score.model';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';
import { PillOption, SelectOption } from '../../../../shared/models/select-option.model';
import { ScoresRestService } from '../../../../shared/services/scores-rest.service';
import { QuestionsRestService } from '../../../services/questions-rest.service';

interface IQuestionInfos {
  question: QuestionDtoApi;
  programs: Program[];
  tags: TagLightDtoApi[];
  score: number;
}

@Component({
  selector: 'alto-programs-questions',
  templateUrl: './programs-questions.component.html',
  styleUrls: ['./programs-questions.component.scss'],
})
export class ProgramsQuestionsComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  @Input() company!: Company;
  @Input() tags: TagDtoApi[] = [];

  questionsInfos: IQuestionInfos[] = [];
  questionsCount = 0;
  questionsPageSize = 10;
  questionsPageControl = new FormControl(1, { nonNullable: true });

  searchControl: FormControl<string | null> = new FormControl(null);
  selectedProgramsControl: FormControl<FormControl<SelectOption>[]> = new FormControl([], {
    nonNullable: true,
  });
  programsOptions: SelectOption[] = [];
  selectedTagsControl: FormControl<FormControl<SelectOption>[]> = new FormControl([], {
    nonNullable: true,
  });
  tagsOptions: SelectOption[] = [];
  selectedScoreControl: FormControl<PillOption | null> = new FormControl(null);
  scoreOptions: PillOption[] = Score.getFiltersPillOptions();

  questionsDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  private readonly programsQuestionsComponentSubscription = new Subscription();

  constructor(
    private readonly scoresRestService: ScoresRestService,
    private readonly questionsRestService: QuestionsRestService,
    private readonly offcanvasService: NgbOffcanvas,
    private modalService: NgbModal,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.programsOptions = this.company.programs.map((program) => {
      return new SelectOption({ value: program.id, label: program.name });
    });
    this.tagsOptions = this.tags.map((tag) => {
      return new SelectOption({ value: tag.id, label: tag.name });
    });

    this.programsQuestionsComponentSubscription.add(
      combineLatest([
        this.searchControl.valueChanges.pipe(startWith(this.searchControl.value), debounceTime(300)),
        this.questionsPageControl.valueChanges.pipe(startWith(this.questionsPageControl.value)),
        this.selectedProgramsControl.valueChanges.pipe(startWith(this.selectedProgramsControl.value)),
        this.selectedTagsControl.valueChanges.pipe(startWith(this.selectedTagsControl.value)),
        this.selectedScoreControl.valueChanges.pipe(startWith(this.selectedScoreControl.value)),
      ])
        .pipe(
          switchMap(([searchTerm, page, programsControls, tagsControls, score]) => {
            const req: GetQuestionsStatsRequestParams = {
              search: searchTerm ?? undefined,
              itemsPerPage: this.questionsPageSize,
              page,
              programIds: programsControls.map((x) => x.value.value).join(','),
              tagIds: tagsControls.map((x) => x.value.value).join(','),
            };

            switch (score?.value) {
              case EScoreFilter.Under25:
                req.scoreBelowOrEqual = 0.25;
                break;
              case EScoreFilter.Under50:
                req.scoreBelowOrEqual = 0.5;
                break;
              case EScoreFilter.Under75:
                req.scoreBelowOrEqual = 0.75;
                break;
              case EScoreFilter.Over25:
                req.scoreAboveOrEqual = 0.25;
                break;
              case EScoreFilter.Over50:
                req.scoreAboveOrEqual = 0.5;
                break;
              case EScoreFilter.Over75:
                req.scoreAboveOrEqual = 0.75;
                break;
            }

            return this.scoresRestService.getPaginatedQuestionsStats(EScoreDuration.All, false, req);
          }),
        )
        .subscribe({
          next: ({ data: questionsStats = [], meta }) => {
            this.questionsCount = meta.totalItems;
            this.questionsInfos = questionsStats.map((questionStats) => {
              return {
                question: questionStats.question,
                programs: (questionStats.question.programs
                  ?.map(({ id }) => {
                    return this.company.programById.get(id);
                  })
                  .filter((p) => !!p) ?? []) as Program[],
                tags: questionStats.tags ?? [],
                score: questionStats.score ?? 0,
              };
            });
            this.questionsDataStatus =
              this.questionsInfos.length === 0 ? EPlaceholderStatus.NO_DATA : EPlaceholderStatus.GOOD;
          },
        }),
    );
  }

  // getQuestions(
  //   {
  //     programs = this.questionFilters.programs,
  //     tags = this.questionFilters.tags,
  //     score = this.questionFilters.score,
  //     search = this.questionFilters.search,
  //   }: QuestionFilters = this.questionFilters,
  //   refreshPagination = false,
  // ) {
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
  // }

  // questionPageChange(page: number) {
  //   this.questionsCount = this.questions.length;

  //   this.paginatedQuestions = this.questions.slice(
  //     (page - 1) * this.questionsPageSize,
  //     page * this.questionsPageSize,
  //   );
  // }

  openQuestionForm(question?: QuestionDtoApi) {
    const canvasRef = this.offcanvasService.open(QuestionFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });
    canvasRef.componentInstance.question = question;
    canvasRef.componentInstance.createdQuestion
      .pipe(
        tap(() => {
          this.resetFilters();
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.show({
            type: 'success',
            text: I18ns.programs.questions.questionCreated,
          });
        },
        error: () => {
          this.toastService.show({
            type: 'danger',
            text: I18ns.shared.error,
          });
        },
      });
  }

  deleteQuestion(question: QuestionDtoApi) {
    const modalRef = this.modalService.open(QuestionDeleteModalComponent, { centered: true, size: 'md' });
    const componentInstance = modalRef.componentInstance as QuestionDeleteModalComponent;
    componentInstance.question = question;
    componentInstance.questionDeleted
      .pipe(
        switchMap(() => this.questionsRestService.deleteQuestion(question.id)),
        tap(() => {
          modalRef.close();
          this.resetFilters();
        }),
      )
      .subscribe({
        next: () => {
          this.toastService.show({
            type: 'success',
            text: I18ns.programs.questions.questionDeleted,
          });
        },
        error: () => {
          this.toastService.show({
            type: 'danger',
            text: I18ns.shared.error,
          });
        },
      });
  }

  resetFilters() {
    this.searchControl.patchValue(null, { emitEvent: false });
    this.selectedProgramsControl.patchValue([], { emitEvent: false });
    this.selectedTagsControl.patchValue([], { emitEvent: false });
    this.selectedScoreControl.patchValue(null, { emitEvent: false });
    this.questionsPageControl.patchValue(1);
  }

  getTagTooltip(question: QuestionDtoApi) {
    return question.tags ? question.tags.map((p) => p.name).join(', ') : '';
  }

  getProgramTooltip(question: QuestionDtoApi) {
    return question.programs ? question.programs.map((p) => p.name).join(', ') : '';
  }
}
