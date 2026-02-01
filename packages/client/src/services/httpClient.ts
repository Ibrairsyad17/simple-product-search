import axios, { type AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '../constants/baseUrl';
import type { APIResponse } from '../types/api';
import { toast } from 'sonner';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');

      toast.error('Session expired. Please login again.');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export class HttpClient<T> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  getAll = (): Promise<APIResponse<T[]>> => {
    return axiosInstance
      .get<APIResponse<T[]>>(this.endpoint)
      .then((res) => res.data);
  };

  get = (id: string | number): Promise<APIResponse<T>> => {
    return axiosInstance
      .get<APIResponse<T>>(`${this.endpoint}/${id}`)
      .then((res) => res.data);
  };

  post = (data: unknown): Promise<APIResponse<T>> => {
    return axiosInstance
      .post<APIResponse<T>>(this.endpoint, data)
      .then((res) => res.data);
  };

  put = (id: string | number, data: unknown): Promise<APIResponse<T>> => {
    return axiosInstance
      .put<APIResponse<T>>(`${this.endpoint}/${id}`, data)
      .then((res) => res.data);
  };

  delete = (id: string | number): Promise<APIResponse<T>> => {
    return axiosInstance
      .delete<APIResponse<T>>(`${this.endpoint}/${id}`)
      .then((res) => res.data);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getWithParams = (params: Record<string, any>): Promise<APIResponse<T>> => {
    return axiosInstance
      .get<APIResponse<T>>(this.endpoint, { params })
      .then((res) => res.data);
  };
}

export default axiosInstance;
