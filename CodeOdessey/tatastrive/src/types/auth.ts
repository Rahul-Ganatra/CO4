export type UserRole = 'entrepreneurs' | 'mentors' | 'stakeholders';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}

export interface AuthSession {
  user: User;
  token: string;
  expires: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
