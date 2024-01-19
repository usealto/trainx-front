import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { GetProgramsStatsRequestParams, QuestionSubmittedDtoApi, TagDtoApi } from '@usealto/sdk-ts-angular';
import { Subscription, combineLatest, filter, startWith, switchMap, tap } from 'rxjs';
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
import { TagsFormComponent } from '../create-tags/tag-form.component';
import { SelectOption } from '../../../shared/models/select-option.model';

enum EProgramsTabs {
  Programs = 'programs',
  Questions = 'questions',
  Tags = 'tags',
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

  pageSize = 9;

  tabOptions: ITabOption[] = [
    { label: I18ns.programs.tabs.programs, value: EProgramsTabs.Programs },
    { label: I18ns.programs.tabs.questions, value: EProgramsTabs.Questions },
    { label: I18ns.programs.tabs.tags, value: EProgramsTabs.Tags },
  ];
  activeTab = new FormControl(this.tabOptions[0], { nonNullable: true });
  pageControl = new FormControl(1, { nonNullable: true });
  teamsOptions = new FormControl<FormControl<SelectOption>[]>([], { nonNullable: true });
  durationControl = new FormControl<ScoreDuration>(ScoreDuration.All, { nonNullable: true });
  searchControl = new FormControl<string | null>(null);

  programsComponentSubscription = new Subscription();

  constructor(
    private readonly scoresRestServices: ScoresRestService,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly tagRestService: TagsRestService,
    private readonly tagsService: TagsServiceService,
    public readonly programsStore: ProgramsStore,
    private modalService: NgbModal,
    private readonly scoreService: ScoresService,
    private replaceInTranslationPipe: ReplaceInTranslationPipe,
    private readonly resolversService: ResolversService,
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const data = this.resolversService.getDataFromPathFromRoot(this.activatedRoute.pathFromRoot);
    this.programs = (data[EResolvers.AppResolver] as IAppData).company.programs;
    this.teamsOptions.setValue(
      (data[EResolvers.AppResolver] as IAppData).company.teams.map((x) => {
        return new FormControl(new SelectOption({ value: x.id, label: x.name }), { nonNullable: true });
      }),
    );

    console.log('programs on init : ', new Set(this.programs.map(({ name }) => name)));

    this.programsComponentSubscription.add(
      this.activeTab.valueChanges
        .pipe(
          startWith(this.activeTab.value),
          filter((selectedTab) => selectedTab.value === EProgramsTabs.Programs),
          switchMap(() => {
            return combineLatest([
              this.pageControl.valueChanges.pipe(startWith(this.pageControl.value)),
              this.searchControl.valueChanges.pipe(startWith(this.searchControl.value)),
              this.teamsOptions.valueChanges.pipe(startWith(this.teamsOptions.value)),
              this.durationControl.valueChanges.pipe(startWith(this.durationControl.value)),
            ]);
          }),
          switchMap(([page, searchTerm, selectedTeams, selectedDuration]) => {
            const regex = searchTerm ? new RegExp(searchTerm, 'i') : null;
            console.log(
              'filtered programs : ',
              this.programs
                .filter(({ name }) => {
                  return regex ? regex.test(name) : true;
                })
                .splice((page - 1) * this.pageSize, page * this.pageSize),
            );

            const req: GetProgramsStatsRequestParams = {
              page,
              // itemsPerPage: this.pageSize,
              // ids: this.programs
              //   .filter(({ name }) => {
              //     return regex ? regex.test(name) : true;
              //   })
              //   .splice((page - 1) * this.pageSize, page * this.pageSize)
              //   .map(({ id }) => id)
              //   .join(','),
              teamIds: selectedTeams.map((x) => x.value.value).join(','),
            };

            return this.scoresRestServices.getProgramsStats(selectedDuration, false, req);
          }),
        )
        .subscribe((stats) => {
          console.log('stats : ', stats);
        }),
    );
    // this.programsComponentSubscription.add(
    //   this.tagsPageControl.valueChanges
    //     .pipe(startWith(this.tagsPageControl.value))
    //     .subscribe((page) => this.changeTagsPage(page, this.tags as TagDisplay[])),
    // );

    // this.programsComponentSubscription.add(
    //   this.scoresRestServices
    //     .getTagsStats(ScoreDuration.All, false)
    //     .pipe(
    //       tap((stats) => {
    //         stats.forEach((stat) => {
    //           this.tagsScore.set(stat.tag.id, stat.score || 0);
    //         });
    //       }),
    //       switchMap(() => {
    //         return this.activeTab.valueChanges;
    //       }),
    //     )
    //     .subscribe({
    //       next: () => {
    //         this.resetFilters();
    //       },
    //     }),
    // );
  }

  ngOnDestroy(): void {
    this.programsComponentSubscription.unsubscribe();
  }

  // handleTabChange(value: any) {
  //   this.activeTab = value;
  //   this.resetFilters();
  // }

  // deleteTag(tag: TagDtoApi) {
  //   const modalRef = this.modalService.open(DeleteModalComponent, { centered: true, size: 'md' });

  //   const componentInstance = modalRef.componentInstance as DeleteModalComponent;
  //   componentInstance.data = {
  //     title: this.replaceInTranslationPipe.transform(I18ns.tags.deleteModal.title, tag.name),
  //     subtitle: this.replaceInTranslationPipe.transform(
  //       I18ns.tags.deleteModal.subtitle,
  //       tag.questionsCount ?? 0,
  //     ),
  //   };
  //   componentInstance.objectDeleted
  //     .pipe(switchMap(() => this.tagRestService.deleteTag(tag?.id ?? '')))
  //     .subscribe({
  //       complete: () => {
  //         modalRef.close();
  //         this.tagRestService.resetTags();
  //         this.getTags();
  //       },
  //     });
  // }

  // @memoize()
  // getTagScore(id: string): number {
  //   const output = this.tagsScore.get(id) || 0;
  //   return isNaN(output) ? 0 : output;
  // }

  // getTags(
  //   {
  //     programs = this.tagFilters.programs,
  //     contributors = this.tagFilters.contributors,
  //     search = this.tagFilters.search,
  //     score = this.tagFilters.score,
  //   }: TagFilters = this.tagFilters,
  // ) {
  //   this.isFilteredTags = true;
  //   this.isTagsLoading = true;

  //   this.tagFilters.programs = programs;
  //   this.tagFilters.contributors = contributors;
  //   this.tagFilters.search = search;
  //   this.tagFilters.score = score;

  //   this.tagRestService
  //     .getTags()
  //     .pipe(
  //       tap((tags) => {
  //         this.tags = this.tagsService.filterTags(tags, {
  //           programs,
  //           contributors,
  //           search,
  //         }) as TagDisplay[];
  //         // this.changeTagsPage(this.tags);
  //         this.filterTagsByScore(this.tags as TagDisplay[], this.tagFilters.score);
  //         this.isTagsLoading = false;
  //       }),
  //     )
  //     .subscribe();
  // }

  // filterTagsByScore(tags: TagDisplay[], score?: string) {
  //   if (!score) return;
  //   tags.forEach((tag) => (tag.score = this.getTagScore(tag.id)));
  //   tags = this.scoreService.filterByScore(tags, score as ScoreFilter, true);

  //   // this.changeTagsPage(tags);
  // }

  // openTagForm(tag?: TagDtoApi) {
  //   const canvasRef = this.offcanvasService.open(TagsFormComponent, {
  //     position: 'end',
  //     panelClass: 'overflow-auto',
  //   });

  //   canvasRef.componentInstance.tag = tag;
  //   canvasRef.componentInstance.createdTag.pipe(tap(() => this.getTags())).subscribe();
  // }

  // changeTagsPage(page: number, tags: TagDtoApi[]) {
  //   this.tagsCount = tags.length;
  //   this.paginatedTags = tags.slice((page - 1) * this.tagsPageSize, page * this.tagsPageSize);
  // }

  // resetFilters() {
  //   this.getTags((this.tagFilters = {}));
  //   this.selectedScore = [];
  //   this.isFilteredTags = false;
  // }
}
