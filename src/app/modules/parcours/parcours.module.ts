import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParcoursComponent } from './components/parcours/parcours.component';
import { ParcoursRoutingModule } from './parcours-routing.module';
import { SharedModule } from "../shared/shared.module";



@NgModule({
    declarations: [ParcoursComponent],
    imports: [CommonModule, ParcoursRoutingModule, SharedModule]
})
export class ParcoursModule {}
