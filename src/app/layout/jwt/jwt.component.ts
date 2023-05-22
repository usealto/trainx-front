import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'alto-jwt',
  templateUrl: './jwt.component.html',
  styleUrls: ['./jwt.component.scss']
})
export class JwtComponent implements OnInit {
  constructor(private readonly auth: AuthService) {}
  jwt : any;
  isClicked = false;

  ngOnInit(): void {
    this.auth.idTokenClaims$.subscribe((claims) => {
      this.jwt = claims
    });
  }

  copy(){
    const jwtRaw = this.jwt?.__raw;
    if(jwtRaw){
      // copy to clipboard the jwtRaw
      navigator.clipboard.writeText(jwtRaw);
      // then updates the button to show it has been clicked
      this.isClicked = !this.isClicked
    }
  }
}
