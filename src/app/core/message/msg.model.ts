export interface Msg {
  severity?: MessageLevel;
  title?: string;
  message?: string;
  id?: any;
  type?: MsgType;
  life?: number;
  sticky?: boolean;
  closable?: boolean;
  data?: any;
}

export enum MsgType {
  TOAST,
  INLINE,
}

export type MessageLevel = 'info' | 'success' | 'warn' | 'error';
