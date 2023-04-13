export interface UserCreate {
  email: string;
  companyId: string;
  teamId: string | undefined;
  isUploaded : boolean;
}
