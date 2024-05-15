import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParcoursComponent } from './components/parcours/parcours.component';
import { ParcoursRoutingModule } from './parcours-routing.module';
import { SharedModule } from "../shared/shared.module";
import { EditParcoursComponent } from './components/edit-parcours/edit-parcours.component';
import { ParcoursDragDropComponent } from './components/parcours-drag-drop/parcours-drag-drop.component';
import { DndModule } from 'ngx-drag-drop';



@NgModule({
  declarations: [ParcoursComponent, EditParcoursComponent, ParcoursDragDropComponent],
  imports: [CommonModule, ParcoursRoutingModule, SharedModule, DndModule],
})
export class ParcoursModule {}
