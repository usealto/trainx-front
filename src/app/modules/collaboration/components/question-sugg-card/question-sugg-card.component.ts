import { Component, Input, OnInit } from '@angular/core';
import { QuestionSubmittedDtoApi, UserDtoApi } from '@usealto/sdk-ts-angular';
import { Observable, map, of } from 'rxjs';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';

@Component({
  selector: 'alto-question-sugg-card',
  templateUrl: './question-sugg-card.component.html',
  styleUrls: ['./question-sugg-card.component.scss']
})
export class QuestionSuggCardComponent implements OnInit{
  @Input() questionSugg?: QuestionSubmittedDtoApi;
  user? : UserDtoApi;
  status? : string;
  statusClass? : string;
  
  constructor(private userService: UsersRestService) { }
  ngOnInit(): void {
    switch (this.questionSugg?.status) {
      case 'declined':
        this.status = "Refusée"
        this.statusClass = "alto-badge-red-light"
        break;
      case "accepted":
        this.status = "Accetpée"
        this.statusClass = "alto-badge-green-light"
        break;
      default:
        this.status = "En attente"
        this.statusClass = "alto-badge-orange-light"
        break;
    }    
    
    this.getUser(this.questionSugg?.createdBy)
    .subscribe((u) => { 
      this.user = u;
    });
  }
  @memoize()
  getUser(id: string | undefined): Observable<UserDtoApi | undefined> {
    if (!id) {
      return of(undefined);
    }
    return this.userService.getUsersFiltered({ ids: id }).pipe(map((u) => u.shift()));
  }

  refuse(){
    console.log('TODO : action to develop');
  }

}
