import { Component, Input } from '@angular/core';
import { UserDtoApi, UserLightDtoApi } from '@usealto/sdk-ts-angular';

/**
 * !DEPRECATED To delete after V3.2
 */
@Component({
  selector: 'alto-img-badge-list',
  templateUrl: './img-badge-list.component.html',
  styleUrls: ['./img-badge-list.component.scss'],
})
export class ImgBadgeListComponent {
  @Input() users: (UserDtoApi | UserLightDtoApi)[] = [];
  @Input() limit = 5;
}
