import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Team } from '../../../../models/team.model';
import { Program } from '../../../../models/program.model';
import { DndDropEvent } from 'ngx-drag-drop';
import { Router } from '@angular/router';
import { AltoRoutes } from '../../../shared/constants/routes';
import { I18ns } from '../../../../core/utils/i18n/I18n';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'alto-parcours-drag-drop',
  templateUrl: './parcours-drag-drop.component.html',
  styleUrls: ['./parcours-drag-drop.component.scss'],
})
export class ParcoursDragDropComponent implements OnInit, AfterViewInit {
  @Input() team: Team | null = null;
  @Input() programs: Program[] = [];
  @Output() parcoursChanged = new EventEmitter<string[]>();

  @ViewChild('wrapper') wrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('parcours') parcours!: ElementRef<HTMLDivElement>;

  parcour: Program[] = [];

  placeholderIndex = -1;

  I18ns = I18ns;

  currentlyDraggedProgram: Program | null = null;

  programSearchControl = new FormControl<string | null>(null);

  programsFiltered: Program[] = [];

  selectedOption = 'all';

  constructor(private readonly router: Router, private readonly modalService: NgbModal) {}

  ngOnInit(): void {
    this.parcour = this.team?.parcour.map((id) => this.programs.find((p) => p.id === id) as Program) ?? [];
    this.programs = this.programs.filter((p) => !p.isAccelerated);
    this.programsFiltered = this.programs;

    this.programSearchControl.valueChanges.subscribe((value) => {
      this.applyFilters(value?.toLowerCase() ?? '', this.selectedOption);
    });
  }

  ngAfterViewInit() {
    this.adjustScroll();
  }

  onSelectChange(value: string): void {
    this.selectedOption = value;
    this.applyFilters(this.programSearchControl.value?.toLowerCase() ?? '', value);
  }

  applyFilters(searchValue: string, filterValue: string): void {
    let filtered = this.programs;

    if (filterValue === 'team') {
      filtered = filtered.filter((p) => this.isProgramAssigned(p.id));
    }

    filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchValue?.toLowerCase() ?? ''));

    this.programsFiltered = filtered;
  }

  adjustScroll(isAdd = false) {
    console.log(this.parcours.nativeElement.scrollWidth, this.wrapper.nativeElement.clientWidth);
    const hasHorizontalScrollbar =
      this.parcours.nativeElement.scrollWidth > this.wrapper.nativeElement.clientWidth;
    this.parcours.nativeElement.style.paddingRight = hasHorizontalScrollbar ? '100px' : '0';
    this.parcours.nativeElement.style.paddingLeft = hasHorizontalScrollbar ? '100px' : '0';
    this.parcours.nativeElement.style.justifyContent = hasHorizontalScrollbar ? 'flex-start' : 'center';
    // if isAdd is true, we scroll to the end of the parcours
    if (isAdd) {
      this.parcours.nativeElement.scrollLeft = this.parcours.nativeElement.scrollWidth;
    }
  }

  isProgramAssigned(programId: string): boolean {
    return this.team?.programIds.some((p) => p === programId) ?? false;
  }

  onDrop(event: DndDropEvent, list?: Program[]) {
    let isAdd = false;
    if (list && event.dropEffect === 'move') {
      const program: Program = event.data;
      let newIndex = event.index;

      const currentIndex = list.findIndex((p) => p.id === program.id);

      // check if the program is added at the end of the list
      if (currentIndex === -1 && newIndex === list.length) {
        isAdd = true;
      }

      if (currentIndex !== -1) {
        list.splice(currentIndex, 1);

        if (typeof newIndex !== 'undefined' && newIndex > currentIndex) {
          newIndex--;
        }
      }

      if (typeof newIndex === 'undefined') {
        newIndex = list.length;
      }

      list.splice(newIndex, 0, program);

      this.parcour = list;

      this.currentlyDraggedProgram = null;
    }
    setTimeout(() => this.adjustScroll(isAdd), 0);
  }

  removeFromParcours(program: Program) {
    const index = this.parcour.indexOf(program);
    if (index > -1) {
      this.parcour.splice(index, 1);
    }
    setTimeout(() => this.adjustScroll(), 0);
  }

  isProgramInParcours(program: Program): boolean {
    return this.parcour.some((p) => p.id === program.id);
  }

  saveParcours() {
    const isProgramNotAssigned = this.parcour.some((p) => !this.team?.programIds.some((id) => id === p.id));
    if (isProgramNotAssigned) {
      const modalRef = this.modalService.open(ConfirmModalComponent, { centered: true, size: 'md' });
      const componentInstance = modalRef.componentInstance as ConfirmModalComponent;
      componentInstance.data = {
        title: I18ns.parcours.modal.title,
        subtitle: I18ns.parcours.modal.description,
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        icon: 'bi-pin-angle',
        color: 'blue',
      };
  
      modalRef.closed.subscribe((confirm) => {
        if (confirm) {
          this.parcoursChanged.emit(this.parcour.map((p) => p.id));
        }
      });
    } else {
      this.parcoursChanged.emit(this.parcour.map((p) => p.id));
    }
  }

  goPrevious() {
    this.router.navigate([AltoRoutes.lead, AltoRoutes.parcours]);
  }

  deleteParcours() {
    if (this.parcour.length !== 0) {
      const modalRef = this.modalService.open(ConfirmModalComponent, { centered: true, size: 'md' });
      const componentInstance = modalRef.componentInstance as ConfirmModalComponent;
      componentInstance.data = {
        title: I18ns.parcours.modalDelete.title,
        subtitle: I18ns.parcours.modalDelete.description,
        confirmText: 'Confirmer',
        cancelText: 'Annuler',
        icon: 'bi-trash',
      };

      modalRef.closed.subscribe((confirm) => {
        if (confirm) {
          this.parcoursChanged.emit([]);
        }
      });
    } else {
      this.parcoursChanged.emit([]);
    }
  }

  onDragStart(event: DragEvent, index: number) {
    this.currentlyDraggedProgram = this.parcour[index];
  }

  onListDragStart(event: DragEvent, index: number) {
    this.currentlyDraggedProgram = this.programsFiltered[index];
  }

  onEnd() {
    this.currentlyDraggedProgram = null;
  }
}
