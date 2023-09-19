import { QuestionsSubmittedRestService } from './../../../programs/services/questions-submitted-rest.service';
import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PatchQuestionSubmittedDtoApi, PatchQuestionSubmittedRequestParams, QuestionSubmittedDtoApi, UserDtoApi } from '@usealto/sdk-ts-angular';
import { Observable, map, of, tap } from 'rxjs';
import { memoize } from 'src/app/core/utils/memoize/memoize';
import { UsersRestService } from 'src/app/modules/profile/services/users-rest.service';
import { SuggQuestionRefuseModalComponent } from '../sugg-question-refuse-modal/sugg-question-refuse-modal.component';

@Component({
  selector: 'alto-sugg-question-card',
  templateUrl: './sugg-question-card.component.html',
  styleUrls: ['./sugg-question-card.component.scss']
})
export class SuggQuestionCardComponent implements OnInit{
  @Input() suggQuestion?: QuestionSubmittedDtoApi;
  user? : UserDtoApi;
  status? : string;
  statusClass? : string;
  
  constructor(
    private userService: UsersRestService,
    private modalService: NgbModal,
    private QuestionsSubmittedRestService: QuestionsSubmittedRestService,
    ) { }
  ngOnInit(): void {
    switch (this.suggQuestion?.status) {
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
    
    this.getUser(this.suggQuestion?.createdBy)
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

  refuseQuestion(){
    console.log('TODO : action to develop');
    const modalRef = this.modalService.open(SuggQuestionRefuseModalComponent, {
       centered: true, size: 'md' 
      });

    const componentInstance = modalRef.componentInstance as SuggQuestionRefuseModalComponent;
    componentInstance.data = {
      title: 'Refuser une question',
      subtitle: 'Souhaitez-vous envoyer un message à Phoenix Baker pour expliquer votre choix ?',
      icon: 'bi-x-circle',
      color: 'badge-double-error',
      button: 'Refuser ',
      textarea: 'Réponse à Phoenix Baker (facultatif)',
    };
    
    componentInstance.objectDeleted
      .pipe(
        tap(
          () => {
            console.log(this.suggQuestion);
            
            if(!this.suggQuestion){
              return;
            }  
            console.log('ffff');
            // for some reason, the call is not working
            this.QuestionsSubmittedRestService.update({
              id: this.suggQuestion.id, 
              patchQuestionSubmittedDtoApi: {
                status: 'declined' as PatchQuestionSubmittedDtoApi['status'],
              }
            })
          }
        ),
        tap(() => {
          modalRef.close();
          console.log('her');
          // from another template, not sure to use this here
          // this.location.back();
        }),
        // from another template, not sure to use this here
        // untilDestroyed(this),
      )
      .subscribe();
    
  }

  createQuestion(){
    console.log('TODO : action to develop');
  }


}
