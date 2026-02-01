import axios, { type AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '../constants/baseUrl';
import type { APIResponse } from '../types/api';
import { toast } from 'sonner';

// Create axios instance with base configuration
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

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem('token');

      // Show error toast
      toast.error('Session expired. Please login again.');

      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Generic HttpClient class for making API requests
 */
export class HttpClient<T> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * GET request to fetch all items
   */
  getAll = (): Promise<APIResponse<T[]>> => {
    return axiosInstance
      .get<APIResponse<T[]>>(this.endpoint)
      .then((res) => res.data);
  };

  /**
   * GET request to fetch a single item by ID
   */
  get = (id: string | number): Promise<APIResponse<T>> => {
    return axiosInstance
      .get<APIResponse<T>>(`${this.endpoint}/${id}`)
      .then((res) => res.data);
  };

  /**
   * POST request to create a new item
   */
  post = (data: unknown): Promise<APIResponse<T>> => {
    return axiosInstance
      .post<APIResponse<T>>(this.endpoint, data)
      .then((res) => res.data);
  };

  /**
   * PUT request to update an item
   */
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
