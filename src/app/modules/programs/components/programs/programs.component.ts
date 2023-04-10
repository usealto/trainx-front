import { Component, OnInit } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import {
  GetScoresRequestParams,
  ProgramApi,
  QuestionApi,
  QuestionPaginatedResponseApi,
  QuestionSubmittedApi,
  ScoreTimeframeEnumApi,
  ScoresResponseDtoApi,
  TagApi,
  UserApi,
} from 'src/app/sdk';
import { ProgramsRestService } from '../../services/programs-rest.service';
import { QuestionsRestService } from '../../services/questions-rest.service';
import { QuestionFormComponent } from '../questions/question-form/question-form.component';
import { ScoresRestService } from '../../services/scores-rest.service';
import { QuestionsSubmittedRestService } from '../../services/questions-submitted-rest.service';
import { TagsRestService } from '../../services/tags-rest.service';
import { TagsFormComponent } from '../tags/tag-form/tag-form.component';

@UntilDestroy()
@Component({
  selector: 'alto-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
})
export class ProgramsComponent implements OnInit {
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;
  //
  programs!: ProgramApi[];
  programsPage = 1;
  programsCount = 0;
  programPageSize = 9;
  //
  questions!: QuestionApi[];
  questionsPage = 1;
  questionsCount = 0;
  questionsPageSize = 10;
  isQuestionsLoading = true;
  userCache = new Map<string, UserApi>();
  questionsScore = new Map<string, number>();
  pillsRowDisplayLimit = 3;
  submittedQuestions!: QuestionSubmittedApi[];
  submittedQuestionsPage = 1;
  submittedQuestionsCount = 0;
  submittedQuestionsPageSize = 10;
  isSubmittedQuestionsLoading = true;
  tags!: TagApi[];
  tagsPage = 1;
  tagsCount = 0;
  tagsPageSize = 10;
  isTagsLoading = true;
  tagPrograms = new Map<string, string[]>();
  isTagProgramsLoading = true;

  constructor(
    private readonly offcanvasService: NgbOffcanvas,
    private readonly programService: ProgramsRestService,
    private readonly questionsService: QuestionsRestService,
    private readonly usersService: UsersRestService,
    private readonly scoresServices: ScoresRestService,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly tagRestService: TagsRestService,
  ) {}

  ngOnInit(): void {
    this.getPrograms();
    this.getQuestions();
    this.getSubmittedQuestions();
    this.getTags().subscribe();
  }

  openQuestionForm() {
    const canvasRef = this.offcanvasService.open(QuestionFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });
    canvasRef.componentInstance.createdQuestion.pipe(tap(() => this.getQuestions())).subscribe();
  }

  openTagForm(tag?: TagApi, programs?: string[]) {
    const canvasRef = this.offcanvasService.open(TagsFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

      canvasRef.componentInstance.tag = tag;
    canvasRef.componentInstance.createdTag.pipe(switchMap(() => this.getTags())).subscribe();
  }

  changeProgramPage() {
    this.getPrograms();
  }

  getPrograms() {
    this.programService
      .getProgramsPaginated({ page: this.programsPage, itemsPerPage: this.programPageSize })
      .pipe(
        tap((p) => (this.programs = p.data ?? [])),
        tap((p) => (this.programsCount = p.meta.totalItems ?? [])),
        untilDestroyed(this),
      )
      .subscribe();
  }

  getQuestions() {
    this.isQuestionsLoading = true;

    this.questionsService
      .getQuestionsPaginated({ page: this.questionsPage, itemsPerPage: this.questionsPageSize })
      .pipe(
        tap((q) => (this.questions = q.data ?? [])),
        tap((q) => (this.questionsCount = q.meta.totalItems ?? 0)),
        switchMap((q) => forkJoin([this.getScoresfromQuestions(q), of(q)])),
        map(([scores, questions]) => questions.data?.map((q) => q.createdBy) ?? []),
        map((userIds) => userIds.filter((x, y) => userIds.indexOf(x) === y)),
        switchMap((ids) => this.getUsersfromQuestions(ids)),
        tap((users) => users.forEach((u) => this.userCache.set(u.id, u))),
        tap(() => (this.isQuestionsLoading = false)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  getUsersfromQuestions(ids: string[]): Observable<UserApi[]> {
    const filter = ids.filter((i) => !this.userCache.has(i)).join(',');
    return this.usersService.getUsers({ ids: filter }).pipe();
  }

  getScoresfromQuestions(questions: QuestionPaginatedResponseApi): Observable<ScoresResponseDtoApi> {
    const ids = questions.data?.map((q) => q.id);
    return this.scoresServices
      .getQuestionScore({
        timeframe: ScoreTimeframeEnumApi.Year,
        ids: ids?.join(','),
      } as GetScoresRequestParams)
      .pipe(
        tap((scores) => {
          ids?.forEach((id) =>
            this.questionsScore.set(id, scores.scores.some((score) => score.id === id) ? 0.42 : 0),
          );
        }),
      );
  }

  changeQuestionsPage() {
    this.getQuestions();
  }

  @memoize()
  getUser(id: string) {
    return this.userCache.get(id);
  }

  @memoize()
  getQuestionScore(id: string) {
    return this.questionsScore.get(id);
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
        switchMap((ids) => this.getUsersfromQuestions(ids)),
        tap((users) => users.forEach((u) => this.userCache.set(u.id, u))),
        tap(() => (this.isSubmittedQuestionsLoading = false)),
      )
      .subscribe();
  }

  changeSubmittedQuestionsPage() {
    this.getSubmittedQuestions();
  }

  getTags(): Observable<UserApi[]> {
    return this.tagRestService
      .getTagsPaginated({
        page: this.tagsPage,
        itemsPerPage: this.tagsPageSize,
      })
      .pipe(
        tap((t) => (this.tags = t.data ?? [])),
        tap((t) => (this.tagsCount = t.meta.totalItems ?? 0)),
        tap((t) => this.getProgramsfromTags(t.data ?? [])),
        map((tags) => tags.data?.map((t) => t.createdBy) ?? []),
        map((userIds) => userIds.filter((x, y) => userIds.indexOf(x) === y)),
        switchMap((ids) => this.getUsersfromQuestions(ids)),
        tap((users) => users.forEach((u) => this.userCache.set(u.id, u))),
        tap(() => (this.isTagsLoading = false)),
      );
  }

  getProgramsfromTags(tags: TagApi[]) {
    const ids = tags.map((tag) => tag.id);
    this.isTagProgramsLoading = true;
    this.programService
      .getPrograms({ tagIds: ids.join(',') })
      .pipe(
        tap((programs) => {
          ids.forEach((tagId) => {
            this.tagPrograms.set(tagId, this.tagProgramsLoop(tagId, programs));
          });
        }),
        tap(() => (this.isTagProgramsLoading = false)),
      )
      .subscribe();
  }

  tagProgramsLoop(tagId: string, programs: ProgramApi[]): string[] {
    const programList: string[] = [];
    programs.forEach((program) => {
      if (program.tags?.some((tag) => tag.id === tagId)) {
        programList.push(program.name);
      }
    });
    return programList;
  }

  @memoize()
  getTagPrograms(id: string): string[] {
    return this.tagPrograms.get(id) ?? [];
  }

  changeTagsPage() {
    this.getTags().subscribe();
  }
}
