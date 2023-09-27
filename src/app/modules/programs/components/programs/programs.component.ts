import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  QuestionDtoApi,
  QuestionStatsDtoApi,
  QuestionSubmittedDtoApi,
  TagDtoApi,
  TagStatsDtoApi,
  UserDtoApi,
} from '@usealto/sdk-ts-angular';
import { Observable, combineLatest, map, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { QuestionDeleteModalComponent } from 'src/app/modules/shared/components/question-delete-modal/question-delete-modal.component';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { ReplaceInTranslationPipe } from '../../../../core/utils/i18n/replace-in-translation.pipe';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { ScoreDuration, ScoreFilter } from '../../../shared/models/score.model';
import { QuestionFilters } from '../../models/question.model';
import { TagFilters } from '../../models/tag.model';
import { ProgramsStore } from '../../programs.store';
import { QuestionsRestService } from '../../services/questions-rest.service';
import { QuestionsSubmittedRestService } from '../../services/questions-submitted-rest.service';
import { TagsRestService } from '../../services/tags-rest.service';
import { TagsServiceService } from '../../services/tags-service.service';
import { QuestionFormComponent } from '../questions/question-form/question-form.component';
import { TagsFormComponent } from '../tags/tag-form/tag-form.component';

interface TagDisplay extends TagDtoApi {
  score?: number;
}
interface QuestionDisplay extends QuestionDtoApi {
  score?: number;
}
@UntilDestroy()
@Component({
  selector: 'alto-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class ProgramsComponent implements OnInit {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  //
  programsCount = 0;
  //
  questions: QuestionDtoApi[] = [];
  paginatedQuestions!: QuestionDtoApi[];
  questionsPage = 1;
  questionsCount = 0;
  questionsPageSize = 10;
  isQuestionsLoading = true;
  questionsScore = new Map<string, number>();
  questionFilters: QuestionFilters = { programs: [], tags: [], search: '' };
  contributors: { id: string; fullname: string }[] = [];
  selectedItems: QuestionDtoApi[] = [];
  isFilteredQuestions = false;
  //
  userCache = new Map<string, UserDtoApi>();
  pillsRowDisplayLimit = 3;
  submittedQuestions: QuestionSubmittedDtoApi[] = [];
  submittedQuestionsPage = 1;
  submittedQuestionsCount = 0;
  submittedQuestionsPageSize = 10;
  isSubmittedQuestionsLoading = true;
  //
  tags!: TagDtoApi[];
  paginatedTags!: TagDtoApi[];
  tagsPage = 1;
  tagsCount = 0;
  tagsPageSize = 10;
  isTagsLoading = true;
  tagPrograms = new Map<string, string[]>();
  isTagProgramsLoading = true;
  tagFilters: TagFilters = { programs: [], contributors: [], search: '', score: '' };
  tagsScore = new Map<string, number>();
  isFilteredTags = false;

  tabData = [
    { label: I18ns.programs.tabs.programs, value: 'programs' },
    { label: I18ns.programs.tabs.questions, value: 'questions' },
    { label: I18ns.programs.tabs.tags, value: 'tags' },
  ];
  activeTab = this.tabData[0].value;

  constructor(
    private readonly offcanvasService: NgbOffcanvas,
    private readonly questionsService: QuestionsRestService,
    private readonly scoresRestServices: ScoresRestService,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly tagRestService: TagsRestService,
    private readonly tagsService: TagsServiceService,
    public readonly teamStore: TeamStore,
    private readonly profileStore: ProfileStore,
    public readonly programsStore: ProgramsStore,
    private modalService: NgbModal,
    private readonly scoreService: ScoresService,
    private replaceInTranslationPipe: ReplaceInTranslationPipe,
  ) {}

  ngOnInit(): void {
    this.getQuestions();
    this.getSubmittedQuestions();
    this.getTags();

    combineLatest([this.getScoresFromTags(), this.getScoresfromQuestions()]).subscribe();
  }

  handleTabChange(value: any) {
    this.activeTab = value;
    this.resetFilters();
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
          this.tagRestService.resetTags();
          this.getTags();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  deleteTag(tag: TagDtoApi) {
    const modalRef = this.modalService.open(DeleteModalComponent, { centered: true, size: 'md' });

    const componentInstance = modalRef.componentInstance as DeleteModalComponent;
    componentInstance.data = {
      title: this.replaceInTranslationPipe.transform(I18ns.tags.deleteModal.title, tag.name),
      subtitle: this.replaceInTranslationPipe.transform(
        I18ns.tags.deleteModal.subtitle,
        tag.questionsCount ?? 0,
      ),
    };
    componentInstance.objectDeleted
      .pipe(
        switchMap(() => this.tagRestService.deleteTag(tag?.id ?? '')),
        tap(() => {
          modalRef.close();
          this.tagRestService.resetTags();
          this.getTags();
          this.getQuestions();
        }),
        untilDestroyed(this),
      )
      .subscribe();
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
          this.tagRestService.resetTags();
          this.getTags();
        }),
      )
      .subscribe();
  }

  openSubmittedQuestionForm(question?: QuestionSubmittedDtoApi) {
    const canvasRef = this.offcanvasService.open(QuestionFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });
    canvasRef.componentInstance.question = question;
    canvasRef.componentInstance.isSubmitted = true;
    canvasRef.componentInstance.dismissedQuestion.pipe(tap(() => this.getSubmittedQuestions())).subscribe();
    canvasRef.componentInstance.createdQuestion.pipe(tap(() => this.getQuestions())).subscribe();
  }

  openTagForm(tag?: TagDtoApi) {
    const canvasRef = this.offcanvasService.open(TagsFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.tag = tag;
    canvasRef.componentInstance.createdTag.pipe(tap(() => this.getTags())).subscribe();
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
    this.isQuestionsLoading = true;
    this.isFilteredQuestions = true;

    this.questionFilters.programs = programs;
    this.questionFilters.tags = tags;
    this.questionFilters.score = score;

    this.questionFilters.search = search;

    this.questionsService
      .getQuestions({
        programIds: programs?.join(','),
        tagIds: tags?.join(','),
        search,
      })
      .pipe(
        tap((questions) => {
          this.questions = questions;
          this.questionsCount = questions.length;
          if (refreshPagination) {
            this.questionsPage = 1;
          }
          this.changeQuestionsPage(questions);
        }),
        map(() => this.questions.map((q) => q.createdBy) ?? []),
        map((userIds) => userIds.filter((x, y) => userIds.indexOf(x) === y)),
        map((ids) => this.getUsersfromIds(ids)),
        tap((users) => users.forEach((u) => this.userCache.set(u.id, u))),
        tap(() => {
          this.filterQuestionsByScore(this.questions as QuestionDisplay[], this.questionFilters.score);
          this.isQuestionsLoading = false;
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  filterQuestionsByScore(questions: QuestionDisplay[], score?: string) {
    if (!score) return;

    questions.forEach((question) => (question.score = this.getQuestionScore(question.id)));

    questions = this.scoreService.filterByScore(questions, score as ScoreFilter, true);

    this.changeQuestionsPage(questions);
  }

  getUsersfromIds(ids: string[]): UserDtoApi[] {
    const filter = ids.filter((i) => !this.userCache.has(i));
    return this.profileStore.users.value.filter((u) => filter.some((i) => i === u.id));
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

  getScoresFromTags(): Observable<TagStatsDtoApi[]> {
    return this.scoresRestServices.getTagsStats(ScoreDuration.All, false).pipe(
      tap((stats) => {
        stats.forEach((stat) => {
          this.tagsScore.set(stat.tag.id, stat.score || 0);
        });
      }),
    );
  }

  changeQuestionsPage(questions: QuestionDtoApi[]) {
    this.questionsCount = questions.length;
    this.paginatedQuestions = questions.slice(
      (this.questionsPage - 1) * this.questionsPageSize,
      this.questionsPage * this.questionsPageSize,
    );
  }

  @memoize()
  getUser(id: string) {
    return this.userCache.get(id);
  }

  @memoize()
  getQuestionScore(id: string): number {
    const output = this.questionsScore.get(id) || 0;
    return isNaN(output) ? 0 : output;
  }

  @memoize()
  getTagScore(id: string): number {
    const output = this.tagsScore.get(id) || 0;
    return isNaN(output) ? 0 : output;
  }

  getSubmittedQuestions() {
    return this.questionsSubmittedRestService
      .getQuestionsPaginated({
        page: this.submittedQuestionsPage,
        itemsPerPage: this.submittedQuestionsPageSize,
      })
      .pipe(
        tap((q) => (this.submittedQuestions = q.data ?? [])),
        tap((q) => (this.submittedQuestionsCount = q.meta.itemsPerPage ?? 0)),
        map((questions) => questions.data?.map((q) => q.createdBy) ?? []),
        map((userIds) => userIds.filter((x, y) => userIds.indexOf(x) === y)),
        map((ids) => this.getUsersfromIds(ids)),
        tap((users) => users.forEach((u) => this.userCache.set(u.id, u))),
        tap(() => (this.isSubmittedQuestionsLoading = false)),
      )
      .subscribe();
  }

  changeSubmittedQuestionsPage() {
    this.getSubmittedQuestions();
  }

  getTags(
    {
      programs = this.tagFilters.programs,
      contributors = this.tagFilters.contributors,
      search = this.tagFilters.search,
      score = this.tagFilters.score,
    }: TagFilters = this.tagFilters,
  ) {
    this.isFilteredTags = true;
    this.isTagsLoading = true;

    this.tagFilters.programs = programs;
    this.tagFilters.contributors = contributors;
    this.tagFilters.search = search;
    this.tagFilters.score = score;

    this.tagRestService
      .getTags()
      .pipe(
        tap((tags) => {
          this.tags = this.tagsService.filterTags(tags, {
            programs,
            contributors,
            search,
          }) as TagDisplay[];
          this.changeTagsPage(this.tags);
        }),
        map(() => this.tags.map((t) => t.createdBy) ?? []),
        map((userIds) => userIds.filter((x, y) => userIds.indexOf(x) === y)),
        map((ids) => this.getUsersfromIds(ids)),
        tap((users) => users.forEach((u) => this.userCache.set(u.id, u))),
        tap(() => {
          this.filterTagsByScore(this.tags as TagDisplay[], this.tagFilters.score);
          this.isTagsLoading = false;
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  filterTagsByScore(tags: TagDisplay[], score?: string) {
    if (!score) return;
    tags.forEach((tag) => (tag.score = this.getTagScore(tag.id)));
    tags = this.scoreService.filterByScore(tags, score as ScoreFilter, true);

    this.changeTagsPage(tags);
  }

  changeTagsPage(tags: TagDtoApi[]) {
    if (this.tagsPage > Math.ceil(tags.length / this.tagsPageSize)) {
      this.tagsPage = 1;
    }
    this.tagsCount = tags.length;
    this.paginatedTags = tags.slice(
      (this.tagsPage - 1) * this.tagsPageSize,
      this.tagsPage * this.tagsPageSize,
    );
  }

  resetFilters() {
    this.getQuestions((this.questionFilters = {}));
    this.getTags((this.tagFilters = {}));
    this.selectedItems = [];
    this.isFilteredQuestions = false;
    this.isFilteredTags = false;
  }

  @memoize()
  getFullname(user: UserDtoApi) {
    return user?.firstname + ' ' + user?.lastname;
  }
}
