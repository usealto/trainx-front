import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParcoursComponent } from './components/parcours/parcours.component';
import { ParcoursRoutingModule } from './parcours-routing.module';
import { SharedModule } from "../shared/shared.module";
import { EditParcoursComponent } from './components/edit-parcours/edit-parcours.component';



@NgModule({
    declarations: [ParcoursComponent, EditParcoursComponent],
    imports: [CommonModule, ParcoursRoutingModule, SharedModule]
})
export class ParcoursModule {}
