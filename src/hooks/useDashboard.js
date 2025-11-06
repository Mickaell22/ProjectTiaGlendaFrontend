import { useState, useEffect, useCallback } from 'react';
import { useAuth } from 'src/contexts/AuthContext';
import { dashboardService } from 'src/services/dashboardService';

/**
 * Custom hook for managing dashboard data and state
 * Provides unified interface for all dashboard types
 */
export const useDashboard = (dashboardType) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Determine which dashboard API to call
  const getDashboardData = useCallback(async () => {
    if (!user || !dashboardType) {
      return null;
    }

    switch (dashboardType) {
      case 'admin':
        return await dashboardService.getAdminDashboard();
      case 'therapist':
        return await dashboardService.getTherapistDashboard();
      case 'pedagogue':
        return await dashboardService.getPedagogueDashboard();
      case 'general':
        return await dashboardService.getGeneralStats();
      default:
        throw new Error(`Unknown dashboard type: ${dashboardType}`);
    }
  }, [user, dashboardType]);

  // Load dashboard data
  const loadData = useCallback(async (forceRefresh = false) => {
    if (!user || !dashboardType) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Clear cache if force refresh
      if (forceRefresh) {
        dashboardService.clearCache();
      }

      const result = await getDashboardData();

      if (result) {
        setData(result);
        setLastUpdated(new Date());
      } else {
        throw new Error('No data received from dashboard API');
      }
    } catch (err) {
      console.error(`Error loading ${dashboardType} dashboard:`, err);
      setError(dashboardService.handleError(err));
    } finally {
      setLoading(false);
    }
  }, [user, dashboardType, getDashboardData]);

  // Refresh data
  const refresh = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  // Auto-refresh setup with Page Visibility API
  useEffect(() => {
    const autoRefreshInterval = 5 * 60 * 1000; // 5 minutes

    // Handle visibility change - refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && !loading && !error) {
        loadData(false);
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up interval for auto-refresh (only when visible)
    const interval = setInterval(() => {
      if (!document.hidden && !loading && !error) {
        loadData(false); // Use cache if available
      }
    }, autoRefreshInterval);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loading, error, loadData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Preload other dashboards in the background
  useEffect(() => {
    if (data && user) {
      // Preload other dashboard data for faster navigation
      dashboardService.preloadDashboards();
    }
  }, [data, user]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    retry: loadData,
    isStale: lastUpdated ? (Date.now() - lastUpdated.getTime()) > 10 * 60 * 1000 : false // 10 minutes
  };
};

/**
 * Hook for dashboard statistics and metrics
 */
export const useDashboardStats = () => {
  return useDashboard('general');
};

/**
 * Hook for admin dashboard
 */
export const useAdminDashboard = () => {
  return useDashboard('admin');
};

/**
 * Hook for therapist dashboard
 */
export const useTherapistDashboard = () => {
  return useDashboard('therapist');
};

/**
 * Hook for pedagogue dashboard
 */
export const usePedagogueDashboard = () => {
  return useDashboard('pedagogue');
};

export default useDashboard;