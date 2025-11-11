import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Use relative path in dev mode to leverage Vite proxy, or env variable in production
// Vite proxy is configured in vite.config.ts to forward /api to http://localhost:4000
const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await api.post('/api/auth/refresh', {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Use base path for GitHub Pages - Vite sets BASE_URL from vite.config.ts base option
        const basePath = import.meta.env.BASE_URL || '/booking-system/';
        // Remove trailing slash and add /login
        const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
        window.location.href = `${normalizedBase}/login`;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'CLIENT';
  createdAt: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  durationMin: number;
  priceCents: number;
  active: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED';
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
  service: Service;
  user: {
    id: string;
    email: string;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  register: async (email: string, name: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', {
      email,
      name,
      password,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    await api.post('/api/auth/logout', { refreshToken });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  me: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/api/auth/me');
    return response.data;
  },
};

export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    const response = await api.get<Service[]>('/api/services');
    return response.data;
  },

  getById: async (id: string): Promise<Service> => {
    const response = await api.get<Service>(`/api/services/${id}`);
    return response.data;
  },
};

export const bookingsApi = {
  create: async (serviceId: string, startsAt: string): Promise<Booking> => {
    const response = await api.post<Booking>('/api/bookings', {
      serviceId,
      startsAt,
    });
    return response.data;
  },

  getAll: async (): Promise<Booking[]> => {
    const response = await api.get<Booking[]>('/api/bookings');
    return response.data;
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await api.get<Booking>(`/api/bookings/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: Booking['status']): Promise<Booking> => {
    const response = await api.put<Booking>(`/api/bookings/${id}/status`, {
      status,
    });
    return response.data;
  },
};

