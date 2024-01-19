import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { setUserMe } from 'src/app/core/store/root/root.action';
import { IUser, User } from 'src/app/models/user.model';
import * as FromRoot from './../../../../core/store/store.reducer';
@Component({
  selector: 'alto-impersonation-header',
  templateUrl: './impersonation-header.component.html',
  styleUrls: ['./impersonation-header.component.scss'],
})
export class ImpersonationHeaderComponent implements OnInit {
  constructor(private router: Router, private readonly store: Store<FromRoot.AppState>) {}

  impersonatedUser =
    localStorage.getItem('impersonatedUser') !== '' && localStorage.getItem('impersonatedUser');
  impersonatedUserEmail = localStorage.getItem('impersonatedUser');
  isAdmin = false;

  ngOnInit(): void {
    this.store.select(FromRoot.selectUserMe).subscribe(({ data: user }) => {
      this.isAdmin = user.isAltoAdmin();
    });
  }

  removeImpersonation() {
    localStorage.setItem('impersonatedUser', '');
    this.store.dispatch(setUserMe({ user: new User({} as IUser) }));
    this.impersonatedUser = false;
    this.router.navigate(['/']);
    location.reload();
  }
}
