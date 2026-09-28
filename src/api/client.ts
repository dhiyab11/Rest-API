import { ApiResponse } from '../types/index.js';

type ApiListener = (info: {
  method: string;
  url: string;
  status: number;
  durationMs: number;
  timestamp: string;
}) => void;

const listeners: Set<ApiListener> = new Set();

export function onApiResponse(cb: ApiListener) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function notifyListeners(info: {
  method: string;
  url: string;
  status: number;
  durationMs: number;
  timestamp: string;
}) {
  listeners.forEach(fn => fn(info));
}

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('smartcampus_token');
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ response: ApiResponse<T>; durationMs: number }> {
    const url = endpoint.startsWith('http') ? endpoint : endpoint.startsWith('/api') ? endpoint : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const start = performance.now();
    let status = 500;

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      status = res.status;
      const durationMs = Math.round((performance.now() - start) * 10) / 10;

      notifyListeners({
        method: options.method || 'GET',
        url,
        status,
        durationMs,
        timestamp: new Date().toLocaleTimeString(),
      });

      const data: ApiResponse<T> = await res.json();

      if (!res.ok) {
        return {
          response: {
            success: false,
            message: data.message || `Request failed with status ${res.status}`,
            statusCode: res.status,
            data: data.data,
          },
          durationMs,
        };
      }

      return { response: data, durationMs };
    } catch (err: any) {
      const durationMs = Math.round((performance.now() - start) * 10) / 10;
      notifyListeners({
        method: options.method || 'GET',
        url,
        status: 500,
        durationMs,
        timestamp: new Date().toLocaleTimeString(),
      });

      return {
        response: {
          success: false,
          message: err.message || 'Network communication error',
          statusCode: 500,
        },
        durationMs,
      };
    }
  }

  public async get<T = any>(url: string, headers?: Record<string, string>) {
    return this.request<T>(url, { method: 'GET', headers });
  }

  public async post<T = any>(url: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public async put<T = any>(url: string, body?: any, headers?: Record<string, string>) {
    return this.request<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public async delete<T = any>(url: string, headers?: Record<string, string>) {
    return this.request<T>(url, { method: 'DELETE', headers });
  }
}

export const api = new ApiClient();
