import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { QuestionSubmittedDtoApi, TagDtoApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, startWith, switchMap, tap } from 'rxjs';
import { EmojiName } from 'src/app/core/utils/emoji/data';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { TeamStore } from 'src/app/modules/lead-team/team.store';
import { AltoRoutes } from 'src/app/modules/shared/constants/routes';
import { ScoresRestService } from 'src/app/modules/shared/services/scores-rest.service';
import { ScoresService } from 'src/app/modules/shared/services/scores.service';
import { IAppData } from '../../../../core/resolvers';
import { EResolvers, ResolversService } from '../../../../core/resolvers/resolvers.service';
import { ReplaceInTranslationPipe } from '../../../../core/utils/i18n/replace-in-translation.pipe';
import { Program } from '../../../../models/program.model';
import { DeleteModalComponent } from '../../../shared/components/delete-modal/delete-modal.component';
import { ITabOption } from '../../../shared/components/tabs/tabs.component';
import { ScoreDuration, ScoreFilter } from '../../../shared/models/score.model';
import { QuestionDisplay } from '../../models/question.model';
import { TagFilters } from '../../models/tag.model';
import { ProgramsStore } from '../../programs.store';
import { QuestionsRestService } from '../../services/questions-rest.service';
import { TagsRestService } from '../../services/tags-rest.service';
import { TagsServiceService } from '../../services/tags-service.service';
import { TagsFormComponent } from '../tags/tag-form/tag-form.component';

interface TagDisplay extends TagDtoApi {
  score?: number;
}

@Component({
  selector: 'alto-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class ProgramsComponent implements OnInit, OnDestroy {
  Emoji = EmojiName;
  I18ns = I18ns;
  AltoRoutes = AltoRoutes;

  programs: Program[] = [];

  //
  activeProgramCount = 0;

  //
  pillsRowDisplayLimit = 3;
  submittedQuestions: QuestionSubmittedDtoApi[] = [];
  submittedQuestionsPage = 1;
  submittedQuestionsCount = 0;
  submittedQuestionsPageSize = 10;
  isSubmittedQuestionsLoading = true;
  //
  tags!: TagDtoApi[];
  paginatedTags!: TagDtoApi[];
  tagsPageControl = new FormControl(1, { nonNullable: true });
  tagsCount = 0;
  tagsPageSize = 10;
  isTagsLoading = true;
  tagPrograms = new Map<string, string[]>();
  isTagProgramsLoading = true;
  tagFilters: TagFilters = { programs: [], contributors: [], search: '', score: '' };
  tagsScore = new Map<string, number>();
  isFilteredTags = false;
  selectedScore = [];

  tabOptions: ITabOption[] = [
    { label: I18ns.programs.tabs.programs, value: 'programs' },
    { label: I18ns.programs.tabs.questions, value: 'questions' },
    { label: I18ns.programs.tabs.tags, value: 'tags' },
  ];
  activeTab = new FormControl(this.tabOptions[0] ?? null);

  programsComponentSubscription = new Subscription();

  constructor(
    private readonly scoresRestServices: ScoresRestService,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly tagRestService: TagsRestService,
    private readonly tagsService: TagsServiceService,
    public readonly teamStore: TeamStore,
    public readonly programsStore: ProgramsStore,
    private readonly questionsService: QuestionsRestService,
    private modalService: NgbModal,
    private readonly scoreService: ScoresService,
    private replaceInTranslationPipe: ReplaceInTranslationPipe,
    private readonly resolversService: ResolversService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.programs = (data[EResolvers.AppResolver] as IAppData).company.programs;

    this.programsComponentSubscription.add(
      this.tagsPageControl.valueChanges
        .pipe(startWith(this.tagsPageControl.value))
        .subscribe((page) => this.changeTagsPage(page, this.tags as TagDisplay[])),
    );

    this.programsComponentSubscription.add(
      combineLatest([
        this.scoresRestServices.getTagsStats(ScoreDuration.All, false),
        this.questionsService.getQuestions(),
        this.scoresRestServices.getQuestionsStats(ScoreDuration.All, false),
      ])
        .pipe(
          tap(([stats, questions, questionsScores]) => {
            stats.forEach((stat) => {
              this.tagsScore.set(stat.tag.id, stat.score || 0);
            });

            this.programsStore.questionsInitList.value = questions.map((q) => {
              return {
                ...q,
                score: questionsScores.find((qs) => qs.id === q.id)?.score || 0,
              } as QuestionDisplay;
            });
          }),
          switchMap(() => {
            return this.activeTab.valueChanges;
          }),
        )
        .subscribe({
          next: () => {
            this.resetFilters();
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.programsComponentSubscription.unsubscribe();
  }

  handleTabChange(value: any) {
    this.activeTab = value;
    this.resetFilters();
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
      .pipe(switchMap(() => this.tagRestService.deleteTag(tag?.id ?? '')))
      .subscribe({
        complete: () => {
          modalRef.close();
          this.tagRestService.resetTags();
          this.getTags();
        },
      });
  }

  @memoize()
  getTagScore(id: string): number {
    const output = this.tagsScore.get(id) || 0;
    return isNaN(output) ? 0 : output;
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
          // this.changeTagsPage(this.tags);
          this.filterTagsByScore(this.tags as TagDisplay[], this.tagFilters.score);
          this.isTagsLoading = false;
        }),
      )
      .subscribe();
  }

  filterTagsByScore(tags: TagDisplay[], score?: string) {
    if (!score) return;
    tags.forEach((tag) => (tag.score = this.getTagScore(tag.id)));
    tags = this.scoreService.filterByScore(tags, score as ScoreFilter, true);

    // this.changeTagsPage(tags);
  }

  openTagForm(tag?: TagDtoApi) {
    const canvasRef = this.offcanvasService.open(TagsFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    canvasRef.componentInstance.tag = tag;
    canvasRef.componentInstance.createdTag.pipe(tap(() => this.getTags())).subscribe();
  }

  changeTagsPage(page: number, tags: TagDtoApi[]) {
    this.tagsCount = tags.length;
    this.paginatedTags = tags.slice((page - 1) * this.tagsPageSize, page * this.tagsPageSize);
  }

  resetFilters() {
    this.getTags((this.tagFilters = {}));
    this.selectedScore = [];
    this.isFilteredTags = false;
  }
}
