import { Component, OnInit } from '@angular/core';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { ProfileStore } from 'src/app/modules/profile/profile.store';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import {
  GetScoresRequestParams,
  ProgramDtoApi,
  QuestionDtoApi,
  QuestionDtoPaginatedResponseApi,
  QuestionSubmittedDtoApi,
  ScoreTimeframeEnumApi,
  ScoresResponseDtoApi,
  TagDtoApi,
  UserDtoApi,
} from 'src/app/sdk';
import { ProgramFilters } from '../../models/program.model';
import { QuestionFilters } from '../../models/question.model';
import { TagFilters } from '../../models/tag.model';
import { ProgramsStore } from '../../programs.store';
import { ProgramsRestService } from '../../services/programs-rest.service';
import { ProgramsService } from '../../services/programs.service';
import { QuestionsRestService } from '../../services/questions-rest.service';
import { QuestionsSubmittedRestService } from '../../services/questions-submitted-rest.service';
import { ScoresRestService } from '../../services/scores-rest.service';
import { TagsRestService } from '../../services/tags-rest.service';
import { QuestionFormComponent } from '../questions/question-form/question-form.component';
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
  programs: ProgramDtoApi[] = [];
  programsDisplay: ProgramDtoApi[] = [];
  programFilters: ProgramFilters = { teams: [], search: '' };
  programsPage = 1;
  programsCount = 0;
  programPageSize = 9;
  //
  questions!: QuestionDtoApi[];
  questionsPage = 1;
  questionsCount = 0;
  questionsPageSize = 10;
  isQuestionsLoading = true;
  questionsScore = new Map<string, number>();
  questionFilters: QuestionFilters = { programs: [], tags: [], contributors: [], search: '' };
  //
  userCache = new Map<string, UserDtoApi>();
  pillsRowDisplayLimit = 3;
  submittedQuestions!: QuestionSubmittedDtoApi[];
  submittedQuestionsPage = 1;
  submittedQuestionsCount = 0;
  submittedQuestionsPageSize = 10;
  isSubmittedQuestionsLoading = true;
  //
  tags!: TagDtoApi[];
  tagsPage = 1;
  tagsCount = 0;
  tagsPageSize = 10;
  isTagsLoading = true;
  tagPrograms = new Map<string, string[]>();
  isTagProgramsLoading = true;
  tagFilters: TagFilters = { programs: [], search: '' };
  //

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

  openQuestionForm(question?: QuestionDtoApi) {
    const canvasRef = this.offcanvasService.open(QuestionFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });
    canvasRef.componentInstance.question = question;
    canvasRef.componentInstance.createdQuestion.pipe(tap(() => this.getQuestions())).subscribe();
  }

  openTagForm(tag?: TagDtoApi) {
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

  getQuestions(
    {
      programs = this.questionFilters.programs,
      tags = this.questionFilters.tags,
      contributors = this.questionFilters.contributors,
      search = this.questionFilters.search,
    }: QuestionFilters = this.questionFilters,
  ) {
    this.isQuestionsLoading = true;

    this.questionFilters.programs = programs;
    this.questionFilters.tags = tags;
    this.questionFilters.contributors = contributors;
    this.questionFilters.search = search;

    this.questionsService
      .getQuestionsPaginated({
        page: this.questionsPage,
        itemsPerPage: this.questionsPageSize,
        programIds: programs?.join(','),
        tagIds: tags?.join(','),
        createdBy: contributors?.length ? contributors?.join(',') : undefined,
        search,
      })
      .pipe(
        tap((questions) => {
          this.questions = questions.data ?? [];
          this.questionsCount = questions.meta.totalItems;
        }),
        switchMap((questions) => forkJoin([this.getScoresfromQuestions(questions), of(questions)])),
        map(([scores, questions]) => questions.data?.map((q) => q.createdBy) ?? []),
        map((userIds) => userIds.filter((x, y) => userIds.indexOf(x) === y)),
        map((ids) => this.getUsersfromQuestions(ids)),
        tap((users) => users.forEach((u) => this.userCache.set(u.id, u))),
        tap(() => (this.isQuestionsLoading = false)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  getUsersfromQuestions(ids: string[]): UserDtoApi[] {
    const filter = ids.filter((i) => !this.userCache.has(i));
    return this.profileStore.users.value.filter((u) => filter.some((i) => i === u.id));
  }

  getScoresfromQuestions(questions: QuestionDtoPaginatedResponseApi): Observable<ScoresResponseDtoApi> {
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
        map((ids) => this.getUsersfromQuestions(ids)),
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
    }: TagFilters = this.tagFilters,
  ): Observable<UserDtoApi[]> {
    this.tagFilters.programs = programs;
    this.tagFilters.contributors = contributors;
    this.tagFilters.search = search;

    return this.tagRestService
      .getTagsPaginated({
        page: this.tagsPage,
        itemsPerPage: this.tagsPageSize,
        programIds: programs?.join(','),
        createdBy: contributors?.join(','),
      })
      .pipe(
        tap((t) => (this.tags = t.data ?? [])),
        tap((t) => (this.tagsCount = t.meta.totalItems ?? 0)),
        tap((t) => this.getProgramsfromTags(t.data ?? [])),
        map((tags) => tags.data?.map((t) => t.createdBy) ?? []),
        map((userIds) => userIds.filter((x, y) => userIds.indexOf(x) === y)),
        map((ids) => this.getUsersfromQuestions(ids)),
        tap((users) => users.forEach((u) => this.userCache.set(u.id, u))),
        tap(() => (this.isTagsLoading = false)),
      );
  }

  getProgramsfromTags(tags: TagDtoApi[]) {
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

  tagProgramsLoop(tagId: string, programs: ProgramDtoApi[]): string[] {
    const programList: string[] = [];
    programs.forEach((program) => {
      if (program.tags?.some((tag) => tag.id === tagId)) {
        programList.push(program.name);
      }
    });
    return programList;
  }

  filterTags(filters: TagFilters) {
    return this.getTags(filters).subscribe();
  }

  @memoize()
  getTagPrograms(id: string) {
    return this.tagPrograms.get(id) ?? [];
  }

  changeTagsPage() {
    this.getTags().subscribe();
  }
}
