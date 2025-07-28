import { API_URL } from '@/lib/api/apiUrl';
import { getCachedToken, refreshAuthToken } from '@/lib/auth/tokenManager';
import { debug } from '@/lib/utils/debug';


export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  retries?: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseUrl: string;
  private defaultRetries: number;

  constructor(baseUrl: string = API_URL, defaultRetries: number = 2) {
    this.baseUrl = baseUrl;
    this.defaultRetries = defaultRetries;
  }

 
  async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      headers = {},
      skipAuth = false,
      retries = this.defaultRetries
    } = config;

    const url = `${this.baseUrl}${endpoint}`;
    let attempt = 0;
    let lastError: Error;

    while (attempt <= retries) {
      try {
        debug.log(`ApiClient: Request attempt ${attempt + 1}/${retries + 1} - ${method} ${endpoint}`);

        // Prepare headers
        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...headers
        };

        // Add authentication if not skipped
        if (!skipAuth) {
          const token = await getCachedToken();
          if (token) {
            requestHeaders.Authorization = `Bearer ${token}`;
          } else {
            debug.warn('ApiClient: No authentication token available');
          }
        }

        // Prepare request options
        const requestOptions: RequestInit = {
          method,
          headers: requestHeaders
        };

        // Add body for non-GET requests
        if (method !== 'GET' && body !== undefined) {
          requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
        }

        // Make the request
        const response = await fetch(url, requestOptions);

        // Handle successful responses
        if (response.ok) {
          debug.log(`ApiClient: Request successful - ${response.status} ${response.statusText}`);
          
          // Return empty object for 204 No Content
          if (response.status === 204) {
            return {} as T;
          }

          // Try to parse JSON response
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return await response.json();
          }

          // Return text for non-JSON responses
          return (await response.text()) as any;
        }

        // Handle 401 Unauthorized - try token refresh on first attempt
        if (response.status === 401 && attempt === 0 && !skipAuth) {
          debug.log('ApiClient: Received 401, attempting token refresh');
          
          try {
            const newToken = await refreshAuthToken();
            if (newToken) {
              debug.log('ApiClient: Token refreshed, retrying request');
              attempt++;
              continue;
            }
          } catch (refreshError) {
            debug.error('ApiClient: Token refresh failed:', refreshError);
          }
        }

        // Handle other error responses
        let errorMessage: string;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || response.statusText;
        } catch {
          errorMessage = response.statusText || 'Request failed';
        }

        const error = new ApiError(
          response.status,
          response.statusText,
          errorMessage,
          response
        );

        // Don't retry client errors (4xx) except 401
        if (response.status >= 400 && response.status < 500 && response.status !== 401) {
          debug.error(`ApiClient: Client error ${response.status}, not retrying:`, errorMessage);
          throw error;
        }

        lastError = error;
        debug.warn(`ApiClient: Request failed (attempt ${attempt + 1}), status: ${response.status}`);

      } catch (error) {
        lastError = error as Error;
        debug.error(`ApiClient: Request error (attempt ${attempt + 1}):`, error);

        // Don't retry network errors on the last attempt
        if (attempt === retries) {
          break;
        }
      }

      attempt++;

      // Add exponential backoff delay before retry
      if (attempt <= retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        debug.log(`ApiClient: Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    debug.error(`ApiClient: All attempts failed for ${method} ${endpoint}`);
    throw lastError!;
  }

  // Convenience methods
  async get<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async patch<T>(endpoint: string, body?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }
}

// Global instance
export const apiClient = new ApiClient();

// Export for convenience
export default apiClient;
