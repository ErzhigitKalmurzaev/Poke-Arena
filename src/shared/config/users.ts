export interface AppUser {
  id: string;
  username: string;
  password: string;
}

/**
 * Mocked user list for the Credentials provider. There is no database:
 * this is the entire user store for the app.
 */
export const USERS: AppUser[] = [
  { id: '1', username: 'admin', password: 'admin123' },
  { id: '2', username: 'guest', password: 'guest123' },
];
