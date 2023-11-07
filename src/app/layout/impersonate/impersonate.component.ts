import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'alto-impersonate',
  templateUrl: './impersonate.component.html',
  styleUrls: ['./impersonate.component.scss']
})
export class ImpersonateComponent implements OnInit{
    user?: string;
  
    constructor(
      private route : ActivatedRoute, 
      private router : Router,
      ){}
  
    ngOnInit(): void {
      this.route.params.subscribe(params => {
        this.user = params['id'];
      });

    }

    impersonate(){
      localStorage.setItem('impersonatedUser', this.user || '');
      this.router.navigate(['/']);
    }

}
