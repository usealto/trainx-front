import { Component, OnInit } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, forkJoin, map, Observable, of, switchMap, takeUntil, tap } from 'rxjs';
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
  TeamApi,
  UserApi,
} from 'src/app/sdk';
import { ProgramsRestService } from '../../services/programs-rest.service';
import { QuestionsRestService } from '../../services/questions-rest.service';
import { QuestionFormComponent } from '../questions/question-form/question-form.component';
import { ScoresRestService } from '../../services/scores-rest.service';
import { QuestionsSubmittedRestService } from '../../services/questions-submitted-rest.service';
import { TagsRestService } from '../../services/tags-rest.service';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { TagsFormComponent } from '../tags/tag-form/tag-form.component';
import { ProgramsStore } from '../../programs.store';
import { ProgramsService } from '../../services/programs.service';
import { ProgramFilters } from '../../models/program.model';

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
  programs: ProgramApi[] = [];
  programsDisplay: ProgramApi[] = [];
  programFilters: ProgramFilters = { teams: [], search: '' };
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
    private readonly programRestService: ProgramsRestService,
    private readonly programService: ProgramsService,
    private readonly questionsService: QuestionsRestService,
    private readonly usersService: UsersRestService,
    private readonly scoresServices: ScoresRestService,
    private readonly questionsSubmittedRestService: QuestionsSubmittedRestService,
    private readonly tagRestService: TagsRestService,
    public readonly teamStore: TeamStore,
    public readonly profileStore: ProfileStore,
    public readonly programsStore: ProgramsStore,
  ) {}

  ngOnInit(): void {
    this.programRestService
      .getPrograms()
      .pipe(
        tap((progs) => {
          this.programs = progs;
          this.programsDisplay = progs;
          this.programsCount = progs.length;
        }),
        untilDestroyed(this),
      )
      .subscribe();

    this.getQuestions();
    this.getSubmittedQuestions();
    this.getTags().subscribe();
  }

  openQuestionForm(question?: QuestionApi) {
    const canvasRef = this.offcanvasService.open(QuestionFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });
    canvasRef.componentInstance.question = question;
    canvasRef.componentInstance.createdQuestion.pipe(tap(() => this.getQuestions())).subscribe();
  }

  openTagForm(tag?: TagApi) {
    const canvasRef = this.offcanvasService.open(TagsFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.tag = tag;
    canvasRef.componentInstance.createdTag.pipe(switchMap(() => this.getTags())).subscribe();
  }

  getProgramsFiltered({
    teams = this.programFilters.teams,
    search = this.programFilters.search,
  }: ProgramFilters) {
    this.programFilters.search = search;
    this.programFilters.teams = teams;

    this.programsDisplay = this.programService.filterPrograms(this.programs, this.programFilters);
    this.programsCount = this.programsDisplay.length;
  }

  getQuestions(programs: string[] = [], tags: string[] = [], contributors: string[] = []) {
    this.isQuestionsLoading = true;

    combineLatest([
      this.questionsService.getQuestionsPaginated({
        page: this.questionsPage,
        itemsPerPage: this.questionsPageSize,
        programIds: programs.join(','),
        tagIds: tags.join(','),
        createdBy: contributors.length > 0 ? contributors.join(',') : undefined,
      }),
      this.usersService.getUsers(),
    ])
      .pipe(
        tap(([questions, users]) => (this.profileStore.users.value = users ?? [])),
        tap(([questions, users]) => (this.questions = questions.data ?? [])),
        tap(([questions, users]) => (this.questionsCount = questions.meta.totalItems ?? 0)),
        switchMap(([questions, users]) => forkJoin([this.getScoresfromQuestions(questions), of(questions)])),
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

  getTags(programs: string[] = []): Observable<UserApi[]> {
    return this.tagRestService
      .getTagsPaginated({
        page: this.tagsPage,
        itemsPerPage: this.tagsPageSize,
        programIds: programs.join(','),
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
    this.programRestService
      .getPrograms()
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

  filterTags(programs: ProgramApi[]) {
    return this.getTags(programs.map((p) => p.id)).subscribe();
  }

  filterQuestionsByPrograms(programs: ProgramApi[]) {
    this.getQuestions(programs.map((p) => p.id));
  }

  filterQuestionsByTags(tags: TagApi[]) {
    this.getQuestions(
      [],
      tags.map((t) => t.id),
    );
  }

  filterQuestionsByContributors(contributors: UserApi[]) {
    this.getQuestions(
      [],
      [],
      contributors.map((c) => c.id),
    );
  }

  @memoize()
  getTagPrograms(id: string) {
    return this.tagPrograms.get(id) ?? [];
  }

  changeTagsPage() {
    this.getTags().subscribe();
  }
}
