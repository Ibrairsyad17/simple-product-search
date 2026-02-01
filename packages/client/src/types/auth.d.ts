export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface GoogleAuthRequest {
  token: string;
}

export interface AuthResponse {
  code: number;
  message: string;
  user: User;
  token: string;
  refreshToken: string;
}

export interface ProfileResponse {
  user: User;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}
