import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'alto-input-toggle',
  templateUrl: './input-toggle.component.html',
  styleUrls: ['./input-toggle.component.scss'],
})
export class InputToggleComponent implements OnInit {
  @Input() control: FormControl<boolean> = new FormControl<boolean>(false, { nonNullable: true });

  ngOnInit(): void {
    this.control.valueChanges.subscribe((value) => {
      console.log(value);
    });
  }
}
