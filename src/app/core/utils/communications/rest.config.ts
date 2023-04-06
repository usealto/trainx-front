export interface RestConfig {
  type: 'GET' | 'POST' | 'PUT' | 'DELETE';
  responseType: 'json' | 'blob';
  token?: string;
  observe?: 'body' | 'event';
  contentType?: string;
}
