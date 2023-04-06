import { MessageLevel } from '../message/msg.model';

export class ApiError {
  handled: boolean;
  err: any;
  title: string;
  message: string;
  level: MessageLevel;
  details?: string;
  is400?: boolean;
  code: any;

  constructor() {
    this.handled = false;
    this.title = '';
    this.message = '';
    this.level = 'error';
  }
}
