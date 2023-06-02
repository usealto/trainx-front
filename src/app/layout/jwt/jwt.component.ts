import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { tap } from 'rxjs';

@Component({
  selector: 'alto-jwt',
  templateUrl: './jwt.component.html',
  styleUrls: ['./jwt.component.scss'],
})
export class JwtComponent implements OnInit {
  constructor(private readonly auth: AuthService) {}
  jwt = '';
  isClicked = false;

  ngOnInit(): void {
    this.auth
      .getAccessTokenSilently()
      .pipe(tap((token) => (this.jwt = token)))
      .subscribe();
  }

  copy() {
    if (this.jwt) {
      // copy to clipboard the jwtRaw
      navigator.clipboard.writeText(this.jwt);
      // then updates the button to show it has been clicked
      this.isClicked = !this.isClicked;
    }
  }
}
