import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { filter, tap } from 'rxjs';
import { IFormBuilder, IFormGroup } from 'src/app/core/form-types';
import { I18ns } from 'src/app/core/utils/i18n/I18n';
import {
  PatchTagDtoApi,
  PatchTagRequestParams,
  ProgramDtoApi,
  QuestionDtoApi,
  TagDtoApi,
} from '@usealto/sdk-ts-angular';
import { TagForm } from '../../../models/tag.form';
import { ProgramsRestService } from '../../../services/programs-rest.service';
import { TagsRestService } from '../../../services/tags-rest.service';

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

  programs: ProgramDtoApi[] = [];
  questions: QuestionDtoApi[] = [];

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    private readonly programService: ProgramsRestService,
    private readonly tagService: TagsRestService,
    readonly fob: UntypedFormBuilder,
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.programService
        .getPrograms()
        .pipe(
          tap((programs) => {
            this.programs = programs ?? [];
          }),
          filter(() => !!this.tag),
          tap((programs) => {
            this.isEdit = true;
            if (this.tag) {
              const { name, description } = this.tag;

              this.programs = programs ?? [];
              this.tagForm.patchValue({
                name,
                // programs: programs?.filter((program) => program.tags?.some((t) => this.tag?.id))
                //   .map((p) => p.id),
                // questions: questions?.map((p) => p.id),
                description,
              });
            }
          }),
        )
        .subscribe();
    }, 0);
  }

  createTag() {
    if (!this.tagForm.value) return;
    const { name, programs, questions, description } = this.tagForm.value;

    if (!this.isEdit && !this.tag) {
      this.tagService
        .createTag({
          name,
          description,
        })
        .pipe(
          tap((tag) => this.createdTag.emit(tag)),
          tap(() => this.activeOffcanvas.dismiss()),
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
        )
        .subscribe();
    }
  }
}
