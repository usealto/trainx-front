import { Injectable } from '@angular/core';
import { TriggerAcceleratedProgramRequestParams, TriggersApiService } from '@usealto/sdk-ts-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TriggersService {
  constructor(private readonly triggersApi: TriggersApiService) {}

  askSlackAuthorization(email: string): Observable<void> {
    return this.triggersApi.triggerAskSlackAuthorization({ slackAdminEmail: email });
  }

  sendGchatInstructions(): Observable<void> {
    return this.triggersApi.triggerSendGchatInstruction();
  }

  launchAcceleratedProgram(params: TriggerAcceleratedProgramRequestParams): Observable<void> {
    return this.triggersApi.triggerAcceleratedProgram(params);
  }
}
