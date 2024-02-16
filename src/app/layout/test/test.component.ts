import { Component } from '@angular/core';
import { buildTime } from 'src/build-time';

@Component({
  selector: 'alto-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent {
  buildTime = buildTime;
}
