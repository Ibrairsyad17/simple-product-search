import axiosInstance from './httpClient';
import type {
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  AuthResponse,
  ProfileResponse,
  RefreshTokenResponse,
} from '../types/auth';

class AuthService {
  private baseUrl = '/auth';

  login = async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      `${this.baseUrl}/login`,
      data
    );
    return response.data;
  };

  register = async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      `${this.baseUrl}/register`,
      data
    );
    return response.data;
  };

  googleAuth = async (data: GoogleAuthRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      `${this.baseUrl}/google`,
      data
    );
    return response.data;
  };

  getProfile = async (): Promise<ProfileResponse> => {
    const response = await axiosInstance.get<ProfileResponse>(
      `${this.baseUrl}/me`
    );
    return response.data;
  };

  refreshToken = async (): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post<RefreshTokenResponse>(
      `${this.baseUrl}/refresh`
    );
    return response.data;
  };

  logout = async (): Promise<void> => {
    await axiosInstance.post(`${this.baseUrl}/logout`);
  };
}

export const authService = new AuthService();
