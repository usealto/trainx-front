import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { GetTagsStatsRequestParams, TagDtoApi } from '@usealto/sdk-ts-angular';
import {
  Subscription,
  combineLatest,
  concat,
  debounceTime,
  first,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { setTags } from '../../../../../core/store/root/root.action';
import * as FromRoot from '../../../../../core/store/store.reducer';
import { EmojiName } from '../../../../../core/utils/emoji/data';
import { I18ns } from '../../../../../core/utils/i18n/I18n';
import { ReplaceInTranslationPipe } from '../../../../../core/utils/i18n/replace-in-translation.pipe';
import { EScoreDuration, EScoreFilter, Score } from '../../../../../models/score.model';
import { DeleteModalComponent } from '../../../../shared/components/delete-modal/delete-modal.component';
import { EPlaceholderStatus } from '../../../../shared/components/placeholder-manager/placeholder-manager.component';
import { PillOption } from '../../../../shared/models/select-option.model';
import { ScoresRestService } from '../../../../shared/services/scores-rest.service';
import { TagsRestService } from '../../../services/tags-rest.service';
import { TagsFormComponent } from '../../create-tags/tag-form.component';

interface ITagInfos {
  tag: TagDtoApi;
  score: number;
}

@Component({
  selector: 'alto-programs-tags',
  templateUrl: './programs-tags.component.html',
  styleUrls: ['./programs-tags.component.scss'],
  providers: [ReplaceInTranslationPipe],
})
export class ProgramsTagsComponent implements OnInit, OnDestroy {
  I18ns = I18ns;
  Emoji = EmojiName;

  tagsInfos: ITagInfos[] = [];
  searchControl = new FormControl<string | null>(null);
  scoreControl = new FormControl<PillOption | null>(null);
  scoreOptions = Score.getFiltersPillOptions();
  pageControl = new FormControl(1, { nonNullable: true });
  itemsPerPage = 10;
  itemsCount = 0;

  tagsDataStatus: EPlaceholderStatus = EPlaceholderStatus.LOADING;
  private readonly programsTagsComponentSubscription = new Subscription();

  constructor(
    private readonly scoresRestService: ScoresRestService,
    private readonly tagRestService: TagsRestService,
    private readonly replaceInTranslationPipe: ReplaceInTranslationPipe,
    private readonly modalService: NgbModal,
    private readonly offcanvasService: NgbOffcanvas,
    private readonly store: Store<FromRoot.AppState>,
  ) {}

  ngOnInit(): void {
    this.programsTagsComponentSubscription.add(
      combineLatest([
        this.pageControl.valueChanges.pipe(startWith(this.pageControl.value)),
        combineLatest([
          concat(of(this.searchControl.value), this.searchControl.valueChanges.pipe(debounceTime(300))),
          this.scoreControl.valueChanges.pipe(startWith(this.scoreControl.value)),
        ]).pipe(tap(() => this.pageControl.patchValue(1))),
      ])
        .pipe(
          switchMap(([page, [searchTerm, score]]) => {
            const req: GetTagsStatsRequestParams = {
              page,
              itemsPerPage: this.itemsPerPage,
              search: searchTerm || undefined,
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
            return this.scoresRestService.getPaginatedTagsStats(EScoreDuration.All, false, req);
          }),
        )
        .subscribe({
          next: ({ data: tagsStats = [], meta }) => {
            this.itemsCount = meta?.totalItems ?? 0;
            this.tagsInfos = tagsStats.map((tagStats) => {
              return {
                tag: tagStats.tag,
                score: tagStats.score ?? 0,
              };
            });

            this.tagsDataStatus =
              this.tagsInfos.length === 0
                ? this.searchControl.value || this.scoreControl.value
                  ? EPlaceholderStatus.NO_RESULT
                  : EPlaceholderStatus.NO_DATA
                : EPlaceholderStatus.GOOD;
          },
        }),
    );
  }

  ngOnDestroy(): void {
    this.programsTagsComponentSubscription.unsubscribe();
  }

  openTagForm(tag?: TagDtoApi): void {
    const canvasRef = this.offcanvasService.open(TagsFormComponent, {
      position: 'end',
      panelClass: 'overflow-auto',
    });

    const instance = canvasRef.componentInstance as TagsFormComponent;
    instance.tag = tag;

    instance.createdTag
      .pipe(
        switchMap(() => {
          return this.tagRestService.getAllTags();
        }),
        tap((tags) => {
          this.store.dispatch(setTags({ tags }));
        }),
        first(),
      )
      .subscribe({
        complete: () => {
          this.resetFilters;
        },
      });
  }

  deleteTag(tag: TagDtoApi): void {
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
        switchMap(() => {
          return this.tagRestService.getAllTags();
        }),
        tap((tags) => {
          this.store.dispatch(setTags({ tags }));
        }),
        first(),
      )
      .subscribe({
        complete: () => {
          modalRef.close();
          this.resetFilters();
        },
      });
  }

  resetFilters(): void {
    this.searchControl.patchValue(null);
    this.scoreControl.patchValue(null);
  }
}
