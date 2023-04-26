import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private dataServiceImpersonatedUser: BehaviorSubject<string> = new BehaviorSubject<string>('Initial Value');
  data: Observable<string> = this.dataServiceImpersonatedUser.asObservable();

  constructor() {}
 
  sendData(data: string) {
    this.dataServiceImpersonatedUser.next(data);
  }
}