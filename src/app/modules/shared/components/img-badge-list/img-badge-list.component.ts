import { Component, Input } from '@angular/core';
import { UserDtoApi } from '@usealto/sdk-ts-angular';

@Component({
  selector: 'alto-img-badge-list',
  templateUrl: './img-badge-list.component.html',
  styleUrls: ['./img-badge-list.component.scss'],
})
export class ImgBadgeListComponent {
  @Input() users: UserDtoApi[] = [];
  @Input() limit = 5;
}
