export interface User {
  id: string;
  name: string;
  username: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  authenticator: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  password: string;
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Array<{
    path: string;
    message: string;
  }>;
}
