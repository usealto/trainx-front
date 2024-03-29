import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { PatchTagDtoApi, PatchTagRequestParams, QuestionDtoApi, TagDtoApi } from '@usealto/sdk-ts-angular';
import { filter, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { ToastService } from 'src/app/core/toast/toast.service';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import * as FromRoot from '../../../../core/store/store.reducer';
import { Program } from '../../../../models/program.model';
import { TagForm } from '../../models/tag.form';
import { TagsRestService } from '../../services/tags-rest.service';

@Component({
  selector: 'alto-tags-form',
  templateUrl: './tag-form.component.html',
  styleUrls: ['./tag-form.component.scss'],
})
export class TagsFormComponent implements OnInit {
  I18ns = I18ns;
  @Input() tag?: TagDtoApi;
  @Output() createdTag = new EventEmitter<TagDtoApi>();

  private fb: IFormBuilder = this.fob;
  tagForm: IFormGroup<TagForm> = this.fb.group<TagForm>({
    name: ['', [Validators.required]],
    programs: [],
    questions: [],
    description: '',
  });

  isEdit = false;

  programs: Program[] = [];
  questions: QuestionDtoApi[] = [];

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    private readonly tagService: TagsRestService,
    readonly fob: UntypedFormBuilder,
    private readonly toastService: ToastService,
    private readonly store: Store<FromRoot.AppState>,
  ) {}

  ngOnInit(): void {
    this.store
      .select(FromRoot.selectCompany)
      .pipe(
        tap(({ data: company }) => {
          this.programs = company.programs ?? [];
        }),
        filter(() => !!this.tag),
        tap(({ data: company }) => {
          this.isEdit = true;
          if (this.tag) {
            const { name, description } = this.tag;

            this.programs = company.programs ?? [];
            this.tagForm.patchValue({
              name,
              description,
            });
          }
        }),
      )
      .subscribe();
  }

  createTag() {
    if (!this.tagForm.value) return;
    const { name, description } = this.tagForm.value;

    if (!this.isEdit && !this.tag) {
      this.tagService
        .createTag({
          name,
          description,
        })
        .pipe(
          tap((tag) => this.createdTag.emit(tag)),
          tap(() => this.activeOffcanvas.dismiss()),
          tap(() =>
            this.toastService.show({
              text: I18ns.tags.form.successCreate,
              type: 'success',
            }),
          ),
        )
        .subscribe();
    } else {
      const params: PatchTagDtoApi = {
        name: name,
        description: description,
      };
      this.tagService
        .updateTag({ id: this.tag?.id, patchTagDtoApi: params } as PatchTagRequestParams)
        .pipe(
          tap((tag) => this.createdTag.emit(tag)),
          tap(() => this.activeOffcanvas.dismiss()),
          tap(() =>
            this.toastService.show({
              text: I18ns.tags.form.successEdit,
              type: 'success',
            }),
          ),
        )
        .subscribe();
    }
  }
}
