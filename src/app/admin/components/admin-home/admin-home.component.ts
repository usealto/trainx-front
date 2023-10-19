import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UserDtoApi } from '@usealto/sdk-ts-angular';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';

@Component({
  selector: 'alto-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss'],
})
export class AdminHomeComponent implements OnInit {
  users: UserDtoApi[] = [];

  userForm: any;
  constructor(private readonly userRestService: UsersRestService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      name: '',
    });
  }

  submit() {
    console.log(this.userForm.value);
  }
}
