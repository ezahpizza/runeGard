import { getTokenInfo } from '@/lib/auth/tokenManager';
import { debug } from '@/lib/utils/debug';

/**
 * Debug utility for monitoring authentication state
 * Can be used in components or called from browser debug
 */
export const debugAuth = () => {
  const tokenInfo = getTokenInfo();
  
  debug.group('🔒 Auth Debug Info');
  debug.log('Token Manager:', tokenInfo);
  
  // Get React Query cache info
  const queryCache = (window as any).__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__?.queryCache;
  if (queryCache) {
    const authQueries = queryCache.getAll()
      .filter((query: any) => 
        query.queryKey?.[0] === 'user' || 
        query.queryKey?.includes('me')
      )
      .map((query: any) => ({
        key: JSON.stringify(query.queryKey),
        state: query.state.status,
        data: query.state.data ? 'HAS_DATA' : 'NO_DATA',
        error: query.state.error?.message,
        lastUpdated: query.state.dataUpdatedAt ? new Date(query.state.dataUpdatedAt).toISOString() : 'NEVER'
      }));
    
    debug.log('Auth-related React Query Cache:', authQueries);
  }
  
  debug.groupEnd();
  
  return {
    tokenInfo,
    timestamp: new Date().toISOString()
  };
};

/**
 * Auto-logging for development
 */
if (process.env.NODE_ENV === 'development') {
  // Make debug function available globally
  (window as any).debugAuth = debugAuth;
  
  // Log auth info every 30 seconds in development
  setInterval(() => {
    const tokenInfo = getTokenInfo();
    if (tokenInfo.hasToken) {
      debug.log('🔒 Auth Status:', tokenInfo);
    }
  }, 30000);
}

export default debugAuth;
