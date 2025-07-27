import { debug } from '@/lib/utils/debug';

interface CachedToken {
  token: string;
  expiresAt: number;
  refreshThreshold: number; // When to start refreshing (5 min before expiry)
}

interface TokenManagerConfig {
  refreshBufferMinutes?: number; // How many minutes before expiry to refresh
  maxRetries?: number;
}

class TokenManager {
  private cachedToken: CachedToken | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private clerkAuth: (() => Promise<string | null>) | null = null;
  private config: Required<TokenManagerConfig>;

  constructor(config: TokenManagerConfig = {}) {
    this.config = {
      refreshBufferMinutes: config.refreshBufferMinutes ?? 5,
      maxRetries: config.maxRetries ?? 3,
    };
  }

  /**
   * Set the Clerk auth function (called from AuthWrapper)
   */
  setClerkAuth(authFn: () => Promise<string | null>) {
    debug.log('TokenManager: Setting auth function');
    this.clerkAuth = authFn;
  }

  /**
   * Get a valid token, using cache when possible
   */
  async getToken(): Promise<string | null> {
    debug.log('TokenManager: Getting token...');

    // If we don't have the auth function set up, return null
    if (!this.clerkAuth) {
      debug.log('TokenManager: No auth function available');
      return null;
    }

    // Check if we have a valid cached token
    if (this.isTokenValid()) {
      debug.log('TokenManager: Using cached token');
      return this.cachedToken!.token;
    }

    // Check if we need to refresh the token
    if (this.shouldRefreshToken()) {
      debug.log('TokenManager: Token needs refresh');
      return this.refreshToken();
    }

    // No cached token, fetch a new one
    debug.log('TokenManager: Fetching new token');
    return this.fetchNewToken();
  }

  /**
   * Force refresh the token (useful for explicit refresh calls)
   */
  async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      debug.log('TokenManager: Using existing refresh promise');
      return this.refreshPromise;
    }

    debug.log('TokenManager: Starting token refresh');
    this.refreshPromise = this.fetchNewToken();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Clear the cached token (useful for logout)
   */
  clearToken() {
    debug.log('TokenManager: Clearing cached token');
    this.cachedToken = null;
    this.refreshPromise = null;
  }

  /**
   * Check if we have a valid cached token
   */
  private isTokenValid(): boolean {
    if (!this.cachedToken) {
      return false;
    }

    const now = Date.now();
    const isValid = now < this.cachedToken.expiresAt;
    
    debug.log('TokenManager: Token validation:', {
      hasToken: !!this.cachedToken,
      expiresAt: new Date(this.cachedToken.expiresAt).toISOString(),
      now: new Date(now).toISOString(),
      isValid
    });

    return isValid;
  }

  /**
   * Check if we should proactively refresh the token
   */
  private shouldRefreshToken(): boolean {
    if (!this.cachedToken) {
      return false;
    }

    const now = Date.now();
    const shouldRefresh = now >= this.cachedToken.refreshThreshold;
    
    debug.log('TokenManager: Refresh check:', {
      refreshThreshold: new Date(this.cachedToken.refreshThreshold).toISOString(),
      now: new Date(now).toISOString(),
      shouldRefresh
    });

    return shouldRefresh;
  }

  /**
   * Fetch a new token from Clerk and cache it
   */
  private async fetchNewToken(): Promise<string | null> {
    if (!this.clerkAuth) {
      debug.log('TokenManager: No auth function available for fetch');
      return null;
    }

    try {
      debug.log('TokenManager: Calling Clerk auth function');
      const token = await this.clerkAuth();
      
      if (!token) {
        debug.log('TokenManager: No token received from Clerk');
        return null;
      }

      // Parse the JWT to get expiration
      const tokenData = this.parseJWT(token);
      const now = Date.now();
      
      // JWT exp is in seconds, convert to milliseconds
      const expiresAt = tokenData.exp * 1000;
      const refreshThreshold = expiresAt - (this.config.refreshBufferMinutes * 60 * 1000);

      this.cachedToken = {
        token,
        expiresAt,
        refreshThreshold
      };

      debug.log('TokenManager: Token cached successfully', {
        expiresAt: new Date(expiresAt).toISOString(),
        refreshThreshold: new Date(refreshThreshold).toISOString(),
        validForMinutes: Math.round((expiresAt - now) / (1000 * 60))
      });

      return token;
    } catch (error) {
      debug.error('TokenManager: Error fetching token:', error);
      return null;
    }
  }

  /**
   * Parse JWT payload without verification (we trust Clerk's token)
   */
  private parseJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      debug.error('TokenManager: Error parsing JWT:', error);
      // Default to 1 hour expiry if we can't parse
      return { exp: Math.floor(Date.now() / 1000) + 3600 };
    }
  }

  /**
   * Get token info for debugging
   */
  getTokenInfo(): { hasToken: boolean; expiresAt?: string; isValid?: boolean } {
    if (!this.cachedToken) {
      return { hasToken: false };
    }

    return {
      hasToken: true,
      expiresAt: new Date(this.cachedToken.expiresAt).toISOString(),
      isValid: this.isTokenValid()
    };
  }
}

// Global instance
export const tokenManager = new TokenManager();

// New enhanced function
export const getCachedToken = async (): Promise<string | null> => {
  return tokenManager.getToken();
};

// Function to set up the auth (called from AuthWrapper)
export const setClerkAuth = (authFn: () => Promise<string | null>) => {
  tokenManager.setClerkAuth(authFn);
};

// Function to clear token (useful for logout)
export const clearAuthToken = () => {
  tokenManager.clearToken();
};

// Function to force refresh token
export const refreshAuthToken = async (): Promise<string | null> => {
  return tokenManager.refreshToken();
};

// Function to get token info for debugging
export const getTokenInfo = () => {
  return tokenManager.getTokenInfo();
};
