export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  code: number;
  message: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  token: string;
  refreshToken: string;
}
