import axiosInstance from './httpClient';
import type {
  LoginRequest,
  RegisterRequest,
  GoogleAuthRequest,
  AuthResponse,
  ProfileResponse,
  RefreshTokenResponse,
} from '../types/auth';
import type { APIResponse } from '../types/api';

class AuthService {
  private baseUrl = '/auth';

  login = async (data: LoginRequest): Promise<APIResponse<AuthResponse>> => {
    const response = await axiosInstance.post<APIResponse<AuthResponse>>(
      `${this.baseUrl}/login`,
      data
    );
    return response.data;
  };

  register = async (
    data: RegisterRequest
  ): Promise<APIResponse<AuthResponse>> => {
    const response = await axiosInstance.post<APIResponse<AuthResponse>>(
      `${this.baseUrl}/register`,
      data
    );
    return response.data;
  };

  googleAuth = async (
    data: GoogleAuthRequest
  ): Promise<APIResponse<AuthResponse>> => {
    const response = await axiosInstance.post<APIResponse<AuthResponse>>(
      `${this.baseUrl}/google`,
      data
    );
    return response.data;
  };

  getProfile = async (): Promise<APIResponse<ProfileResponse>> => {
    const response = await axiosInstance.get<APIResponse<ProfileResponse>>(
      `${this.baseUrl}/me`
    );
    return response.data;
  };

  refreshToken = async (): Promise<APIResponse<RefreshTokenResponse>> => {
    const response = await axiosInstance.post<
      APIResponse<RefreshTokenResponse>
    >(`${this.baseUrl}/refresh`);
    return response.data;
  };

  logout = async (): Promise<void> => {
    await axiosInstance.post(`${this.baseUrl}/logout`);
  };
}

export const authService = new AuthService();
