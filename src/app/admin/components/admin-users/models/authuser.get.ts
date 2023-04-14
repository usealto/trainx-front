export interface AuthUserMetadata {
  bubbleId: string;
  companyId: string;
  teamId: string;
  altoId: string;
} 

export interface AuthUserGet {
  app_metadata: string;
  created_at: string;
  email: string;
  email_verified : string;
  identities: string[]
  last_ip: string;
  last_login: string; 
  logins_count: number
  name: string; 
  nickname  : string;
  picture: string;
  updated_at :  string;
  user_id: string;
  user_metadata: AuthUserMetadata;
  username: string; 
} 