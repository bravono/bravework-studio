export interface SessionUser {
  name?: string;
  email?: string;
  image?: string;
  roles: string[];
}

export interface AuthSession {
  user?: SessionUser;
  expires?: string;
}