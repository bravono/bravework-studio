export interface SessionUser {
  id?: number;
  name?: string;
  email?: string;
  image?: string;
  roles: string[];
}

export interface AuthSession {
  user?: SessionUser;
  expires?: string;
}